/*
* Model.js
*/
'use strict'
const mysql = require('mysql');
const fs = require('fs');
const crypto = require('crypto');
const DBuser = require('./ConnectionInfo')

const connection = mysql.createConnection(DBuser.user);

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

// 5. Friends
var insertFriendShip = 'INSERT INTO friends(userOne, userTwo) VALUES(?,?)';
var selectFriends = 'SELECT * FROM friends WHERE userOne = ? AND userTwo = ?';
var myFriends = 'SELECT * FROM friends WHERE userOne = ? OR userTwo = ?';

// 6. Emails
var insertEmail = 'INSERT INTO emails(userOne, userTwo) VALUES(?,?)';
var selectEmail = 'SELECT * FROM emails WHERE userOne = ? AND userTwo = ?';
var myEmail = 'SELECT * FROM emails WHERE userTwo = ?';
var dealEmail = 'DELETE FROM emails WHERE userOne = ? AND userTwo = ?';

// 7. Talks
var insertTalk = 'INSERT INTO talks(userSend, userGet, content) VALUES(?,?,?)';
var GetTalk = 'SELECT * FROM talks WHERE userSend = ? or userGet = ?';


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

var InsertFriends = function(user1, user2){
    connection.query(insertFriendShip, [user1, user2], function(err, result){
        if(err) throw err;
    });
}

exports.SelectFriendsByName = function(username){
    return new Promise((resolve, reject) => {
        var res = [];
        connection.query(myFriends, [username, username], function(err, result){
            if(err){
                reject(err);
            }
            result.forEach(function(item){
                if(item.userOne == username)
                    res.push(item.userTwo);
                else
                    res.push(item.userOne);
            });
            resolve(res);
        });
    });
}

exports.AreFriends = async function(user1, user2){
    return new Promise((resolve, reject) => {
        var res = {
            'code': 0
        };
        connection.query(selectFriends, [user1, user2], function(err, result){
            if(err) reject(err);
            if(Object.keys(result).length > 0){
                res.code = 1;
                resolve(res);
            }else {
                connection.query(selectFriends, [user2, user1], function(err, result){
                    if(err) reject(err);
                    if(Object.keys(result).length > 0){
                        res.code = 1;
                    }
                    resolve(res);
                });
            }
        });
    });
}

exports.InsertEmail = function(user1, user2){
    connection.query(insertEmail, [user1, user2], function(err, result){
        if(err) throw err;
    });
}

exports.DealEmail = function(user1, user2, accept){
    if(accept){
        InsertFriends(user1, user2);
    }
    connection.query(dealEmail, [user1, user2], function(err, result){
        if(err) throw err;
    });
    connection.query(dealEmail, [user2, user1], function(err, result){
        if(err) throw err;
    });
}

exports.HaveEmail = async function(user1, user2){
    return new Promise((resolve, reject)=>{
        var code = 1;
        connection.query(selectEmail, [user1, user2], function(err, result){
            if(err) throw err;
            if(Object.keys(result).length > 0){
                code = 0;
                resolve(code);
            }
        });
        connection.query(selectEmail, [user2, user1], function(err, result){
            if(err) throw err;
            if(Object.keys(result).length > 0){
                code = -1;
            }
            resolve(code);
        });
    });
}

exports.MyEmail = async function(username){
    return new Promise((resolve, reject)=>{
        var res = [];
        connection.query(myEmail, [username], function(err, result){
            if(err) throw err;
            result.forEach(function(item){
                res.push(item.userOne);
            });
            resolve(res);
        });
    });
}

exports.StoreUserImg = function(userImage, imageUrl){
    var buff = new Buffer(userImage, 'ascii');
    var trueImageUrl = 'static/img/' + imageUrl;
    fs.writeFileSync(trueImageUrl, userImage);
}

exports.StorePostImg = function(imageUrl, imageStream){
    var buff = new Buffer(imageStream, 'ascii');
    var trueImageUrl = 'static/img/' + imageUrl;
    fs.writeFileSync(trueImageUrl, buff, function(err){
        if(err) throw err;
    });
}

exports.StorePostMedia = function(mediaUrl, mediaStream){
    var buff = new Buffer(mediaStream, 'ascii');
    var trueMediaUrl = 'static/img/' + mediaUrl;
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

exports.InsertTalk = function(userSend, userGet, content){
    connection.query(insertTalk, [userSend, userGet, content], function(err, result){
        if(err) throw err;
    })
}

exports.MyTalks = async function(userSend, userGet){
    return new Promise((resolve, reject)=>{
        var res = {
            'talks': []
        };
        connection.query(GetTalk, [userSend, userSend], function(err, result){
            if(err) throw err;
            result.forEach(function(item){
                var talk = {
                    'send': 0,
                    'content': item.content
                };
                if(item.userSend === userSend && item.userGet === userGet){
                    talk.send = 1;
                    res.talks.push(talk);
                }else if(item.userGet === userSend && item.userSend === userGet){
                    talk.send = 0;
                    res.talks.push(talk);
                }
            });
            resolve(res);
        });
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

var changeUserImg = function(newUserImage, userImageUrl){
    var buff = new Buffer(newUserImage, 'ascii');
    var trueImageUrl = 'static/img/' + userImageUrl;
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