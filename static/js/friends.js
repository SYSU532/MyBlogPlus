//friends.js

Vue.use(VueResource);

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
      initFriends();
      AddToggle();
});

let vueFriends = new Vue({
    el: '#friends-list',
    data: {
        items: []
    },
    methods: {
        checkFriendInfo: function (username){
            vueFriends.$http.post('/getUserInfo', {flag: true, name: username}).then(function(response){
                var phone = response.body.phone, email = response.body.email;
                myAlert(username + '\'s Info', 'Username: ' + username + '<br>Phone: ' + phone + '<br>Email: ' + email);
            });
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

function onFriendItemClick(){
    var target = $(this).children(".friend-item");
    target.toggle();
}

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}

