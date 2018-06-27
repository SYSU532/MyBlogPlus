/*
* Model.js
*/
'use strict'
const mysql = require('mysql');
const fs = require('fs');
const crypto = require('crypto');

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '123456',
    database : 'knowit'
});

connection.connect();

// Query sentences definition
// 1. Users
var allUser = 'SELECT * FROM users';
var selectUser = 'SELECT * FROM users WHERE username = ?';
var insertUser = 'INSERT INTO users(username, password, userImageUrl, phone, email) VALUES(?,?,?,?,?)';
var updateUser = 'UPDATE users SET phone = ?, email = ? WHERE username = ?';
var updateUser2 = 'UPDATE users SET phone = ?, email = ?, userImageUrl = ? WHERE username = ?';

// 2. Posts
var allPost = 'SELECT * FROM posts';
var selectPost = 'SELECT * FROM posts WHERE id = ?';
// thumbStore strucyure: [thumbGuy1, thumbGuy2, .....], messStore structure: [[messGuy1, mess1], [messGuy2, mess2], .....]
var insertPost = 'INSERT INTO posts(title, editor, content, imageUrl, mediaUrl) VALUES(?,?,?,?,?)';
var getPostCount = 'SELECT id FROM posts';

// 3. Thumbs
var selectThumb = 'SELECT * FROM thumbs WHERE id = ?';
var insertThumb = 'INSERT INTO thumbs(id, thumbUser) VALUES(?,?)';
var deleteThumb = 'DELETE FROM thumbs WHERE id = ? AND thumbUser = ?';

// 4. Comments
var selectComment = 'SELECT * FROM comments WHERE id = ?';
var insertComment = 'INSERT INTO comments(id, comUser, message) VALUES(?,?,?)';

// 5. Talks
var insertTalk = 'INSERT INTO talks(user, content) VALUES(?,?)';
var allTalk = 'SELECT * FROM talks';

//6. Sessions
let querySession = 'SELECT * FROM session WHERE sessionID = ?';
let removeSession = 'DELETE FROM session WHERE sessionID = ?';
let setSessionUser = 'INSERT INTO session(sessionID, sessionJSON) VALUES(?,?)';

exports.InsertUser = function(username, pass, userImageUrl, phone, email){
    /*
    *  -3 for username already exists, -2 for rePass not equal to pass,
    *  -1 for phone already exists, 0 for email alreadt exists,
    *  1 for success
    */
    var userParam = [username, pass, userImageUrl, phone, email];
    connection.query(insertUser, userParam, function(err, result){
        if(err) throw err;
    });
}

exports.AllUser = async function(){
    return new Promise((resolve, reject)=>{
        connection.query(allUser, function(err, result){
            if(err){
                reject(err);
            }else {
                resolve(result);
            }
        });
    });
}

exports.InsertPost = function(title, editor, postContent, postImageUrl, postMediaUrl){
    var insertParam = [title, editor, postContent, postImageUrl, postMediaUrl];
    connection.query(insertPost, insertParam, function(err, result){
        if(err) throw err;
    });
}

exports.TestLogIn = async function(username, testPass){
    return new Promise((resolve, reject)=>{
        connection.query(allUser, function(err, result){
            var code = -1; // No such user
            if(err){
                reject(err);
            }else {
                result.forEach(function(user) {
                    if(user.username === username){
                        if(testPass == GetDecode_SHA256(user.password)){
                            code = 1; // Success
                        }else code = 0; // Password error
                    }
                });
                resolve(code);
            }
        });
    });
}

exports.ModifyUserInfo = function(username, newUserImage, imgType, newPhone, newEmail){
    var updateParam, updateSen = updateUser;
    if(imgType === ''){
        updateParam = [newPhone, newEmail, username];
    }else {
        updateParam = [newPhone, newEmail, username+imgType, username];
        updateSen = updateUser2;
    }

    connection.query(updateSen, updateParam, function(err, result){
        if(err) throw err;
    });
    var selectParam = [username];
    if(newUserImage !== '')(
        connection.query(selectUser, selectParam, function(err, result){
            if(err) throw err;
            if(newUserImage !== null)
                changeUserImg(newUserImage, result[0].userImageUrl);
        })
    )
}

exports.GiveThumbUp = function(username, postID){
    var insertParam = [postID, username];
    connection.query(insertThumb, insertParam, function(err, result){
        if(err) throw err;
    });
}

exports.DeleteThumbUp = function(username, postID){
    var deleteParam = [postID, username];
    connection.query(deleteThumb, deleteParam, function(err, result){
        if(err) throw err;
    });
}

exports.LeaveMessage = function(username, postID, messContent){
    var insertParam = [postID, username, messContent];
    connection.query(insertComment, insertParam, function(err, result){
        if(err) throw err;
    });
}

exports.GetUserInfo = async function(username){
    return new Promise((resolve, reject)=>{
        var selectParam = [username];
        var res = {};
        connection.query(selectUser, selectParam, function(err, result){
            if(err){
                reject(err);
            }
            if(result.length > 0){
                res['phone'] = result[0].phone;
                res['email'] = result[0].email;
                res['image'] = result[0].userImageUrl;
            }
            resolve(res);
        });
    });
}

// View a single posts's details
exports.ViewSinglePost = async function(postID){
    return new Promise((resolve, reject)=>{
        var res = [];
        var realID = parseInt(postID);
        connection.query(selectPost, [realID], function(err, result){
            if(err){
                reject(err);
            }
            var data = result[0];
            var imageUrl = data.imageUrl, mediaUrl = data.mediaUrl;
            res.push(data.content);
            res.push(imageUrl);
            res.push(mediaUrl);
            res.push(data.editor);
            res.push(data.title);
            connection.query(selectThumb, [realID], function(err, result){
                if(err){
                    reject(err);
                }
                res.push(result.length);
                resolve(res);
            });
        });
    });
}

exports.AddComments = async function(username, id){
    return new Promise((resolve, reject)=>{
        connection.query(selectComment, [id], function(err, result){
            if(err){
                reject(err);
            }
            var comments = {};
            var i = 0;
            result.forEach(function(com){
                var comm = {};
                comm[com.comUser] = com.message;
                comments[i] = comm;
                i++;
            })
            resolve(comments);
        });
    })
}

exports.StoreUserImg = function(userImage, imageUrl){
    var buff = new Buffer(userImage, 'ascii');
    var trueImageUrl = 'img/' + imageUrl;
    fs.writeFileSync(trueImageUrl, buff);
}

exports.StorePostImg = function(imageUrl, imageStream){
    var buff = new Buffer(imageStream, 'ascii');
    var trueImageUrl = 'img/' + imageUrl;
    fs.writeFileSync(trueImageUrl, buff, function(err){
        if(err) throw err;
    });
}

exports.StorePostMedia = function(mediaUrl, mediaStream){
    var buff = new Buffer(mediaStream, 'ascii');
    var trueMediaUrl = 'img/' + mediaUrl;
    fs.writeFileSync(trueMediaUrl, buff, function(err){
        if(err) throw err;
    });
}

exports.GetPostsIDs = async function(){
    return new Promise((resolve, reject)=>{
        var res = [];
        connection.query(getPostCount, function(err, result){
            if(err){
                reject(err);
            }
            result.forEach(function(item){
                res.push(item.id);
            });
            resolve(res);
        });
    })
}

exports.GetAllTalks = async function(){
    return new Promise((resolve, reject)=>{
        var res = {};
        connection.query(allTalk, function(err, result){
            if(err){
                reject(err);
            }
            result.forEach(function(item){
                res[item.user] = res[item.content];
            });
            resolve(res);
        });
    });
}

exports.SendTalk = function(user, content){
    connection.query(insertTalk, [user, content], function(err, result){
        if(err) throw err;
    });
}

exports.checkThumbOrNot = async function(username, id){
    return new Promise((resolve, reject)=>{
        var res = 0;
        connection.query(selectThumb, [id], function(err, result){
            result.forEach(function(item){
                if(item.thumbUser == username)
                    res = 1;
            });
            resolve(res);
        });
    });
}

exports.addSession = async function(sessID, info) {
    return new Promise((resolve, reject) => {
        var param = [sessID, info];
        connection.query(setSessionUser, param, function(err, result) {
            console.log(this.sql);
            if (err) throw err;
        });
    });
}

exports.dropSession = async function(sessID) {
    return new Promise((resolve, reject) => {
        connection.query(removeSession, [sessID], function(err, result) {
            console.log(this.sql);
            if (err) throw err;
        });
    });
}

exports.getSessionInfo = async function(sessID) {
    return new Promise((resolve, reject) => {
        connection.query(querySession, [sessID], function(err, result) {
            console.log(this.sql);
            if (err) throw err;
            console.log(result[0]);
            if (!result[0]) resolve(null);
            resolve(result[0].sessJSON);
        });
    });
}

var changeUserImg = function(newUserImage, userImageUrl){
    var buff = new Buffer(newUserImage, 'ascii');
    var trueImageUrl = 'img/' + userImageUrl;
    fs.writeFileSync(trueImageUrl, buff, function(err){
        if(err) throw err;
    });
}



exports.GetEncode_SHA256 = function(str){
    var secret = 'HoShiNoGen', key = secret.toString('hex');
    var cipher = crypto.createCipher('aes192', key);
    var encode_result = cipher.update(str, 'utf-8', 'hex');
    encode_result += cipher.final('hex');
    return encode_result;
}

var GetDecode_SHA256 = function(str){
    var secret = 'HoShiNoGen', key = secret.toString('hex');
    var decipher = crypto.createDecipher('aes192', key);
    var decode_result = decipher.update(str, 'hex', 'utf-8');
    decode_result += decipher.final('utf-8');
    return decode_result;
}