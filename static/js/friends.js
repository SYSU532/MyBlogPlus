//friends.js

Vue.use(VueResource);

<<<<<<< HEAD
var ws = new WebSocket(`ws://localhost:18088`);
=======
var ws = new WebSocket(`wss://${window.location.host}/wss`);
>>>>>>> 327f990411bac083106e562854903699ae952254
var myImageUrl = '', friendImageUrl = '';

$(document).ready(function(){
    $('#friends-btn').css('background-color', 'white');
    // Initializes and creates emoji set from sprite sheet
    window.emojiPicker = new EmojiPicker({
        emojiable_selector: '[data-emojiable=true]',
        assetsPath: '../img/',
        popupButtonClasses: 'fa fa-smile-o'
      });
      // Finds all elements with `emojiable_selector` and converts them to rich emoji input fields
      // You may want to delay this step if you have dynamically created input fields that appear later in the loading process
      // It can be called as many times as necessary; previously converted input fields will not be converted again
      window.emojiPicker.discover();
      initInfo();
      myImageUrl = 'img/' + window['localStorage'].imageUrl;
      initFriends();
      initChatRoom();
});

let vueFriends = new Vue({
    el: '#friends-list',
    data: {
        items: [],
        clickItem: ''
    },
    methods: {
        checkFriendInfo: function (username){
            vueFriends.$http.post('/getUserInfo', {flag: true, name: username}).then(function(response){
                var phone = response.body.phone, email = response.body.email;
                myAlert(username + '\'s Info', 'Username: ' + username + '<br>Phone: ' + phone + '<br>Email: ' + email);
                $(this.clickItem).toggle();
            });
        },
        AddToggle: function(event){
            AddToggle0(event.target);
            if(event.target.children[3] !== undefined)
                this.clickItem = event.target.children[3];
        },
        chatWithFriend: function(username){
            $("#talking-friend").html(username);
            $(this.clickItem).toggle();
            vueChatList.items = [];
            this.$http.post('/getUserInfo', {flag: true, name: username}).then(function(response){
                friendImageUrl = 'img/' + response.body.imageUrl;
                // Get Old Talking history
                var myName = $("#user-name").children("strong").html();
                var friendName = $("#talking-friend").html();
                this.$http.post('/allTalks', {userSend: myName, userGet: friendName}).then(function(response){
                    var messages = response.body.talks;
                    messages.forEach(function(item){
                        var mySend = item.send == 1 ? true : false;
                        var newItem = {
                            'content': item.content,
                            'imageUrl': mySend ? myImageUrl : friendImageUrl,
                            'send': mySend
                        }
                        vueChatList.items.push(newItem);
                });
            });
            });
            $(".chat-panel").scrollTop($(".chat-panel")[0].scrollHeight);
        }
    }
});

function initFriends(){
    vueFriends.$http.post('/selectFriends', {name: $("#user-name").children("strong").html()}).then(function(response){
        var friends = response.body.friends;
        friends.forEach(function(item){
            var newItem = {
                'username': item,
                'imageUrl': ''
            };
            vueFriends.$http.post('/getUserInfo', {flag: true, name: item}).then(function(response){
                newItem.imageUrl = 'img/' + response.body.imageUrl;
                vueFriends.items.push(newItem);
            });
        });
    });
}

function AddToggle0(el){
    var target = el.children[3];
    $(target).toggle();
}

function onFriendItemClick(){
    var target = $(this).children(".friend-item");
    target.toggle();
}

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}

/*  ----- WebSocket CharRoom Client  -----  */
let vueChatList = new Vue({
    el: '#chat-list',
    data: {
        items: []
    }
});

function initChatRoom(){
    ws.onopen = function(e){
        console.log('WebSocket Server connect success..');
        var myName = $("#user-name").children("strong").html();
        ws.send('hello$' + myName);
    };
    ws.onmessage = function(e){
        parseMessage(e.data);
    }
    // Bind sending and receiving methods
    $("#send").click(onSendMess);
}

function autoGet(username){
    $("#talking-friend").html(username);
    vueChatList.items = [];
    vueChatList.$http.post('/getUserInfo', {flag: true, name: username}).then(function(response){
        friendImageUrl = 'img/' + response.body.imageUrl;
        // Get Old Talking history
        var myName = $("#user-name").children("strong").html();
        var friendName = $("#talking-friend").html();
        vueChatList.$http.post('/allTalks', {userSend: myName, userGet: friendName}).then(function(response){
            var messages = response.body.talks;
            messages.forEach(function(item){
                var mySend = item.send == 1 ? true : false;
                var newItem = {
                    'content': item.content,
                    'imageUrl': mySend ? myImageUrl : friendImageUrl,
                    'send': mySend
                }
                vueChatList.items.push(newItem);
        });
    });
    });
    $(".chat-panel").scrollTop($(".chat-panel")[0].scrollHeight);
}

function parseMessage(mess){
    var res = mess.split('\'$\'');
    var userSend = res[0], userGet = res[1], content = res[2];
    var myName = $("#user-name").children("strong").html();
    if(myName === userSend){
        appendMessage(true, content);
    }else if(myName === userGet){
        if($("#talking-friend").html() === '' && userSend !== undefined){
            autoGet(userSend);
        }else {
            appendMessage(false, content);
        }
    }

}

function onSendMess(){
    var myName = $("#user-name").children("strong").html();
    var friendName = $("#talking-friend").html();
    var content = $("#send-text").val();
    if(friendName === '' || friendName === undefined){
        myAlert('Fatal Error', '<br>Please pick one friend before talking or sending messages!');
        return;
    }else if(content === ''){
        myAlert('Fatal Error', '<br>Do not send empty message to others!');
        return;
    }
    var mess = myName + '\'$\'' + friendName + '\'$\'' + content;
    ws.send(mess);
}

function appendMessage(flag, content){
    // flag: 1 for myself-send, 0 for other-send
    var target = $('.chat-panel');
    var newItem = {
        'content': content,
        'imageUrl': '',
        'send': flag
    };
    if(flag){
        newItem.imageUrl = myImageUrl;
    }else {
        newItem.imageUrl = friendImageUrl;
    }
    vueChatList.items.push(newItem);
    setTimeout(function(){
        $(".chat-panel").scrollTop($(".chat-panel")[0].scrollHeight);
    }, 100);
}