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
            if(isImage(imgType)){
                $(".profile-img").attr('src', window.URL.createObjectURL(fileObj.files[0]));
                imgChanged = true;
                image = fileObj.files[0];
            }else {
                myAlert('Fatal Error', '<br>Please update correct image file!');
            }
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

function isImage(type){
    if(type == '.jpg' || type == '.jpeg' || type == '.png' 
            || type == '.gif' || type == '.ico'){
        return true;
    }else return false;
}

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}

function initUserMess(flag){
    vueUserInfo.$http.post('/getUserInfo').then(function(response){
        var body = response.body, time = 0;
        Store = body;
        if(body.code === 1){
            if(flag == undefined){
                $("#head-img").attr("src", 'img/' + body.imageUrl);
                $("#head-img").css("opacity", "1");
            }
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
        initUserMess(0);
        window['localStorage'].imageUrl = Store.username + imgType+ '?' + Math.random();
        $("#user-img").css("opacity", '0');
        setTimeout(function(){
            $("#user-img").attr("src", 'img/' + Store.username + imgType + '?temp=' + Math.random());
            $("#user-img").css("opacity", '1');
        }, 500);
        myAlert('Success', '<br>User Info Change Success');
    });
}

function onCancel(){
    if(Store.code === 1){
        $("#username").val(Store.username);
        $("#phone").val(Store.phone);
        $("#email").val(Store.email);
    }
}