'use strict'
const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const rawBody = require('raw-body');
const fs = require('fs');
const ws = require('nodejs-websocket');

const control = require('./control/controller.js');

const app = new Koa();

app.use(bodyParser({
    formLimit: '100mb',
    multipart: true
}));

//URLs Handle
router.post('/login', async (ctx, next)=>{
    var username = ctx.request.body.name,
            password = ctx.request.body.pass;
    var loginRes = await control.Login(username, password); // {StateCode, errMessgae}
    var jsonBack = {
        'code' : loginRes['code'], // 0 for failure, 1 for success
        'errMessage' : loginRes['errMessage'] // when fail, print error message
    };
    ctx.response.body = JSON.stringify(jsonBack);
});

router.post('/logup', async (ctx, next)=>{
    var body = ctx.request.query;
    var req = ctx.req;
    var username = body.name, password = body.pass, imgType = body.imageType, rePass = body.rePass,
        userImage = await rawBody(req), phone = body.phone, email = body.email;
    var logupRes = await control.Logup(username, password, rePass, userImage, imgType, phone, email);
    var jsonBack = {
        'code' : logupRes['code'], // 0 for failure, 1 for success
        'errMessage' : logupRes['errMessage'] // when fail, print error message
    };
    ctx.response.body = JSON.stringify(jsonBack);
});

router.post('/data', async (ctx, next)=>{
    var body = ctx.request.body;
    var username = body.name, password = body.pass,
        postID = body.id;
    var dataRes = await control.Data(username, password, postID); // {StateCode, contentData, imageUrl, mediaUrl, thumbStore, messStore}
    var dataRes2 = await control.AddComments(username, postID);
    var jsonBack = {
        'code' : dataRes['code'],
        'editor' : dataRes['editor'],
        'title' : dataRes['title'],
        'content' : dataRes['contentData'], // There must have text content
        'image' : dataRes['imageUrl'], // Image may be null
        'media' : dataRes['mediaUrl'], // Media may be null
        'thumbs' : dataRes['thumbsNum'], 
        'comments' : dataRes2
    };
    var errBack = {
        'errMessage' : 'Invalid user or password!'
    };
    if(dataRes['code']){
        ctx.response.body = JSON.stringify(jsonBack);
    }else {
        ctx.response.body = JSON.stringify(errBack);
    }
});

router.post('/allPostID', async(ctx, next)=>{
    var body = ctx.request.body;
    var dataRes = await control.GetPostIDs();
    var jsonBack = {
        "postIDs" : dataRes
    }
    ctx.response.body = jsonBack;
});

router.post('/upload', async (ctx, next)=>{
    var body = ctx.request.query;
    var username = body.name, password = body.pass,
        title = body.title, content = body.content,imageType = body.imageType, 
        mediaType = body.mediaType;
    var imageStream = null, mediaStream = null;
    if(imageType !== ''){
        imageStream = await rawBody(ctx.req);
    }else if(mediaType !== ''){
        mediaStream = await rawBody(ctx.req);
    }
    var dataRes = await control.Upload(username, password, title, content, 
                                    imageStream, imageType, mediaStream, mediaType); // [StateCode, errMessage]
    var jsonBack = {
        'id' : dataRes['id'],
        'code' : dataRes['code'],
        'errMessgae' : dataRes['errMessage']
    };
    ctx.response.body = JSON.stringify(jsonBack);
});

router.post('/checkThumb', async(ctx, next)=>{
    var body = ctx.request.body;
    var username = body.name, postID = body.id;
    var dataRes = await control.checkThumbOrNot(username, postID);
    var jsonBack = {
        'haveThumb' : dataRes
    };
    ctx.response.body = JSON.stringify(jsonBack);
});

router.post('/thumbUp', async(ctx, next)=>{
    var body = ctx.request.body;
    var thumbUser = body.name, pass = body.pass, postID = body.postID;
    var dataRes = await control.GiveThumbUp(thumbUser, pass, postID);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/thumbDown', async(ctx, next)=>{
    var body = ctx.request.body;
    var thumbUser = body.name, pass = body.pass, postID = body.postID;
    var dataRes = await control.DeleteThumbUp(thumbUser, pass, postID);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/commentUp', async(ctx, next)=>{
    var body = ctx.request.body;
    var thumbUser = body.name, pass = body.pass,
         postID = body.postID, content = body.content;
    var dataRes = await control.LeaveComment(thumbUser, pass, postID, content);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/modifyUserInfo', async(ctx, next)=>{
    var body = ctx.request.query;
    var username = body.name, password = body.pass,
        newEmail = body.newEmail, newPhone = body.newPhone,
        imgType = body.imgType,
        newUserImage = await rawBody(ctx.req);
    if(newUserImage.length < 10){
        newUserImage = null;
    }
    var dataRes = await control.ModifyInfo(username, password, newUserImage, imgType, newPhone, newEmail);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/getUserInfo', async(ctx, next)=>{
    var body = ctx.request.body;
    var jsonBack = {};
    var username = body.name;
    var dataRes = await control.GetInfo(username);
    if(dataRes['code']){
        jsonBack = {
            'code' : 1,
            'username' : username,
            'phone' : dataRes['phone'],
            'email' : dataRes['email'],
            'imageUrl' : dataRes['imageUrl']
        };
    }else {
        jsonBack = dataRes;
    }
    ctx.response.body = JSON.stringify(jsonBack);
});

router.post('/getAllTalks', async(ctx, next)=>{
    var body = ctx.request.body;
    var username = body.name, password = body.pass;
    var dataRes = await control.GetTalks(username, password);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/sendTalk', async(ctx, next)=>{
    var body = ctx.request.body;
    var username = body.name, password = body.pass,
        content = body.content;
    var dataRes = await control.SendTalk(username, password, content);
    ctx.response.body = JSON.stringify(dataRes);
})

app.use(router.routes());

app.listen(18080);
console.log('Server listening in port 18080.......');

var conn_users = [];

var server = ws.createServer(function(conn){
    conn.on('text', async function(str){
        var re = str.split(' ');
        var content = '';
        if(re.length !== 3){
            console.log('Fuck, there is someone who sends unformated data...');
        }
        for(var i=2;i<re.length;i++){
            content += re[i];
            if(i!=re.length-1)
                content += ' ';
        }
        var username = re[0], password = re[1];
        var res = await control.Login(username, password);
        var user = conn;
        if(res.code == 1){
            if(conn_users.indexOf(user) === -1){
                conn_users.push(user);
            }
            conn_users.forEach(function(item){
                item.sendText(username + ' ' + content);
            })
        }else {
            console.log('Fuck, a non-user man wants to connects to the ChatRoom...');
        }
    });
    conn.on('close', function(code, reason){
        console.log('WebSocket连接关闭...');
    });
    conn.on('error', function(code, reason){});
}).listen(18088);

console.log('WebSocket Server listening on port 18088....');