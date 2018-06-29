//search.js

Vue.use(VueResource);

$(document).ready(function(){
    $('#search-btn').css('background-color', 'white');
    $('#search-friend-btn').click(onSearch)
    $('#search').focus(focusSearch);
    $('#search').blur(blurSearch);
    initInfo();
    receiveMails();
});

let vueSearch = new Vue({
    el: 'body'
});

let vueMails = new Vue({
    el: '#all-mails',
    data: {
        items: []
    },
    methods: {
        dealRequest: function(user1){
            myConfirm('Request Dealing', '<br>Do you want to become friends with ' + user1 + '?', function(result){
                if(result){
                    myAlert('OK', '<br>You and ' + user1 + ' have become friends!');
                }else {
                    myAlert('OK', '<br>' + user1 + '\'s friends request has been removed~'); 
                }
                vueMails.$http.post('/dealFriendRequest', {accept: result, requestUser: user1, responseUser: $("#user-name").children("strong").html()}).then(
                    function(response){
                        clearMails();
                        receiveMails();
                    }
                )
            });
        }
    }
});

function clearMails(){
    vueMails.items = [];
}

function receiveMails(){
    vueMails.$http.post('/myFriendRequest', {name: $("#user-name").children("strong").html()}).then(function(response){
        var mails = response.body.requestUser;
        mails.forEach(function(item){
            var newItem = {
                'username': item,
                'imageUrl': ''
            };
            vueSearch.$http.post('/getUserInfo', {flag: true, name: item}).then(function(response){
                newItem.imageUrl = 'img/' + response.body.imageUrl;
                vueMails.items.push(newItem);
            });
        });
    });
}

function focusSearch(){
    $('#search').attr('placeholder', '');
    $('#search').css('background-color', 'white');
}

function blurSearch(){
    $('#search').attr('placeholder', 'New Friend Name');
    $('#search').css('background-color', '#EEEEEE');
}

function onSearch(){
    var hasUser = false, userImgUrl = '', userName = '';
    vueSearch.$http.post('/getUserInfo', {flag: true, name: $("#search").val()}).then(function(response){
        if(response.body.code === 1){
            hasUser = true;
            userImgUrl = response.body.imageUrl;
            userName = response.body.username;
        }
        var target = $('.search-result');
        // Send Search Request and Get result
        target.children().remove();
        if(hasUser){
            var div = '<div class="friends-row" style="width: 420px;cursor: pointer;">';
            var a = '<a class="dropdown-toggle" data-toggle="dropdown"></b></a>';
            var ul = '<ul class="dropdown-menu animated fadeInRight search-item"><li><a class="f-request">Send Friends Request</a></li></ul>';
            var child = $(div+'<img class="friends-img img-circle" src="img/' + userImgUrl + '"></img><span class="search-words">' + userName + '</span>'+a+ul+'</div>');
            target.append(child);
        }else {
            // Alert No User
            myAlert('Search Result', '<br>Not Such User');
        }
        AddToggle();
        AddRequest(userName);
    });
}

function AddToggle(){
    $(".friends-row").click(function(){
        var target = $(".friends-row").children(".dropdown-menu");
        target.toggle();
    });
}

function AddRequest(userName){
    $(".f-request").click(function(){
        var resultName = userName, myName = $("#user-name").children("strong").html();
        if(resultName === myName){
            myAlert('Fatal Error', '<br>Cannot add yourself as your friend !');
        }else {
            vueSearch.$http.post('/areFriends', {user1: myName, user2: resultName}).then(function(response){
                if(response.body.code === 1){
                    console.log('fuck');
                    myAlert('Sorry', '<br> ' + resultName + ' is already one of your friends!');
                }else {
                    vueSearch.$http.post('/haveFriendRequest', {requestUser: myName, responseUser: resultName}).then(function(response){
                        console.log(response.body.code);
                        switch(response.body.code){
                            case 0:
                                myAlert('Sorry', '<br>You have already sent request email to ' + resultName + '!');
                                break;
                            case -1:
                                myAlert('Sorry', '<br>' + resultName + ' have already sent request email to You! Please check your mailbox!');
                                break;
                            case 1:
                                sendRequest(resultName, myName);
                        }
                    });
                }
            });
        }
    });
}

function sendRequest(resultName, myName){
    myConfirm('Add Friend Request', 'Do you want to add<br>' + resultName + '<br>as your new friend?', function(result){
        if(result){
            vueSearch.$http.post('/addFriendRequest', {requestUser: myName, responseUser: resultName}).then(function(){
                myAlert('Success', '<br>The Friend-Adding request has sent to ' + resultName + '\'s mailbox !');
            });
        }
    })
}

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}