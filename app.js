/*
* Test app.js
*/
'use strict'
const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const rawBody = require('raw-body');
const fs = require('fs');

const views = require('koa-views');
const statics = require('koa-static');
const path = require('path');
const ws = require('nodejs-websocket');

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

router.get('/index', async(ctx, next) => {
    await ctx.render('index');
});

router.get('/signin', async(ctx, next) => {
    await ctx.render('login');
});

router.get('/signup', async(ctx, next) => {
    await ctx.render('logup');
});

router.get('/', async(ctx, next) => {
    await ctx.render('login');
});

router.get('/user', async(ctx, next) => {
    await ctx.render('user');
});

router.get('/publish', async(ctx, next) => {
    await ctx.render('publish');
});

router.get('/friends', async(ctx, next) => {
    await ctx.render('friends');
});

router.get('/search', async(ctx, next) => {
    await ctx.render('search');
});

router.get('/details', async(ctx, next) => {
    await ctx.render('details');
})

app.use(router.routes());

app.listen(18080);
console.log('The test server running on port 18080....');