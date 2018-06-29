/*
* app.js
*/
'use strict'
// Koa-modules
const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const views = require('koa-views');
const statics = require('koa-static');
// Other modules
const path = require('path');
const ws = require('nodejs-websocket');
const rawBody = require('raw-body');
const multer = require('koa-multer');
const fs = require('fs');
const session = require('./controller/sessionControl');
// Self-Design modules
const control = require('./controller/control');


const app = new Koa();
app.use(session.session);

app.use(views('view', {
    root: __dirname + '/view',
    default: 'index',
    extension: 'pug'
}));
app.use(statics(
    path.join(__dirname, './static')
));
app.use(koaBody({
    formLimit: '100mb',
    multipart: true
}));
app.use(bodyParser());

/*
* POST Methods
*/
router.post('/login', async(ctx, next) => {
    var data = ctx.request.body;
    var username = data.name, password = data.pass;
    var loginRes = await control.Login(username, password);
    if (loginRes.code === 1) {
        ctx.session = {user: username, pass: password};
    }
    ctx.response.body = JSON.stringify(loginRes);
});

router.post('/logup', async(ctx, next) => {
    var data = ctx.request.query, req = ctx.req;
    var username = data.name, password = data.pass,
        imgType = data.imgType, rePass = data.rePass,
        phone = data.phone, email = data.email, headDefault = data.default;
    var image = null;
    if(headDefault == 0){
        image = await rawBody(ctx.req);
    }else {
        image = fs.readFileSync('static/img/user.jpg');
    }
    var logupRes = await control.Logup(username, password, rePass, image, imgType, phone, email);
    if (logupRes.code === 1) {
        ctx.session = {user: username, pass: password};
    }
    ctx.response.body = JSON.stringify(logupRes);
});


router.post('/data', async (ctx, next) => {
    var body = ctx.request.body;
    var postID = body.id;
    var dataRes = await control.Data(postID, ctx); // {StateCode, contentData, imageUrl, mediaUrl, thumbStore, messStore}
    var dataRes2 = await control.AddComments(ctx.session.user, postID);
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
        'code': dataRes['code'],
        'errMessage' : 'Invalid user or password!'
    };
    if(dataRes['code']){
        ctx.response.body = JSON.stringify(jsonBack);
    }else {
        ctx.response.body = JSON.stringify(errBack);
    }
});

router.post('/allPostID', async(ctx, next) => {
    var body = ctx.request.body;
    var dataRes = await control.GetPostIDs();
    var jsonBack = {
        "postIDs" : dataRes
    }
    ctx.response.body = jsonBack;
});

router.post('/getUserInfo', async(ctx, next) => {
    var otherInfoFlag = ctx.request.body.flag, username;
    if(otherInfoFlag !== undefined){
        username = ctx.request.body.name;
    }else {
        username = ctx.session.user;
    }
    var infoBack = await control.GetInfo(username);
    ctx.response.body = infoBack;
});

router.post('/modifyUserInfo', async(ctx, next) => {
    var username = ctx.session.user, password = ctx.session.pass;
    var body = ctx.request.query;
    var newEmail = body.newEmail, newPhone = body.newPhone, imgType = body.imgType;
    var newImage = '';
    if(imgType !== ''){
        newImage = await rawBody(ctx.req);
    }
    var modifyRes = await control.ModifyInfo(username, password, newImage, imgType, 
                                            newPhone, newEmail);
    ctx.response.body = JSON.stringify(modifyRes);
});

router.post('/logout', async(ctx, next) => {
    ctx.session = {};
    ctx.response.body = {};
});

router.post('/upload', async (ctx, next)=>{
    var body = ctx.request.query;
    var username = ctx.session.user, password = ctx.session.pass,
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
    var username = ctx.session.user, postID = body.id;
    var dataRes = await control.checkThumbOrNot(username, postID);
    var jsonBack = {
        'haveThumb' : dataRes
    };
    ctx.response.body = JSON.stringify(jsonBack);
});

router.post('/thumbUp', async(ctx, next)=>{
    var body = ctx.request.body;
    var thumbUser = ctx.session.user, pass = ctx.session.pass, postID = body.postID;
    var dataRes = await control.GiveThumbUp(thumbUser, pass, postID);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/thumbDown', async(ctx, next)=>{
    var body = ctx.request.body;
    var thumbUser = ctx.session.user, pass = ctx.session.pass, postID = body.postID;
    var dataRes = await control.DeleteThumbUp(thumbUser, pass, postID);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/commentUp', async(ctx, next)=>{
    var body = ctx.request.body;
    var thumbUser = ctx.session.user, pass = ctx.session.pass,
         postID = body.postID, content = body.content;
    var dataRes = await control.LeaveComment(thumbUser, pass, postID, content);
    ctx.response.body = JSON.stringify(dataRes);
});

router.post('/selectFriends', async(ctx, next)=>{
    var body = ctx.request.body;
    var username = body.name;
    var selectRes = await control.SelectFriends(username);
    ctx.response.body = JSON.stringify(selectRes);
});

router.post('/areFriends', async(ctx, next)=>{
    var body = ctx.request.body;
    var user1 = body.user1, user2 = body.user2;
    var checkRes = await control.AreFriends(user1, user2);
    ctx.response.body = JSON.stringify(checkRes);
});

router.post('/addFriendRequest', async(ctx, next)=>{
    var body = ctx.request.body;
    var user1 = body.requestUser, user2 = body.responseUser;
    await control.InsertEmail(user1, user2);
    ctx.response.body = {};
});

router.post('/dealFriendRequest', async(ctx, next)=>{
    var body = ctx.request.body;
    var accept = body.accept, user1 = body.requestUser, user2 = body.responseUser;
    await control.DealEmail(user1, user2, accept);
    ctx.response.body = {};
});

router.post('/haveFriendRequest', async(ctx, next)=>{
    var body = ctx.request.body;
    var user1 = body.requestUser, user2 = body.responseUser;
    var checkRes = await control.HaveEmail(user1, user2);
    ctx.response.body = JSON.stringify(checkRes);
});

router.post('/myFriendRequest', async(ctx, next)=>{
    var body = ctx.request.body;
    var responseUser = body.name;
    var myEmails = await control.MyEmail(responseUser);
    ctx.response.body = JSON.stringify(myEmails);
});

/*
* GET Methods
*/
router.get('/', async(ctx, next) => {
    var session = ctx.session;
    if(session.user === undefined){
        await ctx.render('login');
    }else {
        await ctx.redirect('index');
    }
});
router.get('/index', async(ctx, next) => {
    var session = ctx.session;
    if(session.user === undefined){
        await ctx.redirect('/');
    }else {
        await ctx.render('index');
    }
});
router.get('/signin', async(ctx, next) => {await ctx.render('login');});
router.get('/signup', async(ctx, next) => {await ctx.render('logup');});
router.get('/user', async(ctx, next) => {
    var session = ctx.session;
    if(session.user === undefined){
        await ctx.redirect('/');
    }else {
        await ctx.render('user');
    }
});
router.get('/publish', async(ctx, next) => {
    await ctx.render('publish');var session = ctx.session;
    if(session.user === undefined){
        await ctx.redirect('/');
    }else {
        await ctx.render('publish');
    }
});
router.get('/friends', async(ctx, next) => {
    var session = ctx.session;
    if(session.user === undefined){
        await ctx.redirect('/');
    }else {
        await ctx.render('friends');
    }
});
router.get('/search', async(ctx, next) => {
    var session = ctx.session;
    if(session.user === undefined){
        await ctx.redirect('/');
    }else {
        await ctx.render('search');
    }
});
router.get('/details', async(ctx, next) => {
    var session = ctx.session;
    var id = ctx.request.query.id;
    var availID = await control.checkAvailID(id);
    console.log(availID);
    if(session.user === undefined){
        await ctx.redirect('/');
    }else {
        if(availID)
            await ctx.render('details');
        else
            await ctx.redirect('/index');
    }
});

app.use(router.routes());

app.listen(18080);
console.log('The server running on port 18080....');