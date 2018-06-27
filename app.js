/*
* app.js
*/
'use strict'
// Koa-modules
const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const views = require('koa-views');
const statics = require('koa-static');
// Other modules
const path = require('path');
const ws = require('nodejs-websocket');
const rawBody = require('raw-body');
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
app.use(bodyParser({
    formLimit: '100mb',
    multipart: true
}));

/*
* POST Methods
*/
router.post('/signin', async(ctx, next) => {
    var data = ctx.request.body;
    var username = data.name, password = data.pass;
    var loginRes = await control.Login(username, password);
    if (loginRes.code === 1) {
        ctx.session = {user: username};
    }
    ctx.response.body = JSON.stringify(loginRes);
});


router.post('/data', async (ctx, next)=>{
    var body = ctx.request.body;
    var username = body.name, password = body.pass,
        postID = body.id;
    var dataRes = await control.Data(username, password, postID, ctx); // {StateCode, contentData, imageUrl, mediaUrl, thumbStore, messStore}
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

/*
* GET Methods
*/
router.get('/', async(ctx, next) => {await ctx.render('login');});
router.get('/index', async(ctx, next) => {await ctx.render('index');});
router.get('/signin', async(ctx, next) => {await ctx.render('login');});
router.get('/signup', async(ctx, next) => {await ctx.render('logup');});
router.get('/user', async(ctx, next) => {await ctx.render('user');});
router.get('/publish', async(ctx, next) => {await ctx.render('publish');});
router.get('/friends', async(ctx, next) => {await ctx.render('friends');});
router.get('/search', async(ctx, next) => {await ctx.render('search');});
router.get('/details', async(ctx, next) => {await ctx.render('details');});

app.use(router.routes());

app.listen(18080);
console.log('The server running on port 18080....');