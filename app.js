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
// Self-Design modules
const control = require('./controller/control');

const app = new Koa();
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
    ctx.response.body = JSON.stringify(loginRes);
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