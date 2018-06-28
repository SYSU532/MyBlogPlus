//publish.js

$(document).ready(function(){
    $('#publish-btn').css('background-color', 'white');
    initInfo();
});

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}