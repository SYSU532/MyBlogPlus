//user.js

$(document).ready(function(){
    $('#user-btn').css('background-color', 'white');
    $('#username').val('Palette Chen');
    $('#phone').val('110');
    $('#email').val('0201@ss.ccs');
    $('.profile-img').click(update_img);
    $('#updater').change(function(){
        var $file = $(this);
        var fileObj = $file[0];
        if(fileObj && fileObj.files && fileObj.files[0]){
            $(".profile-img").attr('src', window.URL.createObjectURL(fileObj.files[0]));
        }
    });
    initInfo();
});

function update_img(){
    $('#updater').trigger('click');
}

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}