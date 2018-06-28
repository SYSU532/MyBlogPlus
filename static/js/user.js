//user.js

Vue.use(VueResource);
// Store of user infos
var Store = {};
var imgChanged = false, image = '', imgType = '';

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
            var filepath = $('#updater').val();
            imgType = filepath.substring(filepath.lastIndexOf('.'), filepath.length).toLowerCase();
            $(".profile-img").attr('src', window.URL.createObjectURL(fileObj.files[0]));
            imgChanged = true;
            image = fileObj.files[0];
        }
    });
    initInfo();
    initUserMess();
    $("#commit").click(onChangeInfo);
    $("#cancel").click(onCancel);
});

let vueUserInfo = new Vue({
    el: '.ibox-content'
});

function update_img(){
    $('#updater').trigger('click');
}

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}

function initUserMess(){
    vueUserInfo.$http.post('/getUserInfo').then(function(response){
        var body = response.body;
        Store = body;
        if(body.code === 1){
            $("#head-img").attr("src", 'img/' + body.imageUrl);
            $("#username").val(body.username);
            $("#phone").val(body.phone);
            $("#email").val(body.email);
        }
    });
}

function onChangeInfo(){
    var newImg = '';
    if(imgChanged){
        newImg = image;
    }
    var extraUrl = "?newEmail=" + $("#email").val() + "&newPhone=" + $("#phone").val()
                    + "&imgType=" + imgType;
    vueUserInfo.$http.post('/modifyUserInfo' + extraUrl, newImg, {
        method: 'post',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
    }).then(function(response){
        initUserMess();
        window['localStorage'].imageUrl = Store.username + imgType;
        $("#user-img").attr("src", 'img/' + Store.username + imgType);
        myAlert('Success', '<br>User Info Change Success');
    });
}

function onCancel(){
    if(Store.code === 1){
        $("#head-img").attr("src", 'img/' + Store.imageUrl);
        $("#username").val(Store.username);
        $("#phone").val(Store.phone);
        $("#email").val(Store.email);
    }
}