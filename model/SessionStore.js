const session = require('koa-session-minimal')
const MysqlSession = require('koa-mysql-session')
// class dbStore extends Store {
//     constructor() {
//         super();
//     }
//
//     async get(sid, ctx) {
//         return await await database.getSessionInfo(sid);
//     }
//
//     async set(session, { sid =  this.getID(24), maxAge = 86400000 } = {}, ctx) {
//         await await database.addSession(sid, JSON.stringify(session));
//         return sid;
//     }
//
//     async destroy(sid, ctx) {
//         await await database.dropSession(sid);
//     }
// }

exports.store = new MysqlSession({
    user: 'knowit',
    password: 'sysu532',
    database: 'knowit',
    host: 'localhost',
});