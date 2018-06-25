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
    })
});

function update_img(){
    $('#updater').trigger('click');
}