//friends.js

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
      $('.friends-row').click(onFriendItemClick);
      $('.f-profiles').click(onViewFriendProfiles);
      $('#send.profile-btn').click(onSendMessageClick);
      initInfo();
});

function onFriendItemClick(){
    var target = $(this).children(".friend-item");
    target.toggle();
}

function onViewFriendProfiles(){
    var f_profile = 'Username: Follower 1<br>Phone: 110<br>Email: 101@ww.ss<br>';
    myAlert('Friend Profile', f_profile, function(){});
}

function onSendMessageClick(){
    //
}

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}

