// Logup.js
var username = /^[a-zA-Z][a-zA-z0-9\_]{5,17}/, phone = /^[1-9][0-9]{10}$/;
var mail = /^[a-zA-Z0-9\_\-]+@(([a-zA-Z0-9\_\-])+\.)+[a-zA-Z]{2,4}$/, password = /^[0-9a-zA-Z-_][0-9a-zA-Z-_]{5,11}$/;
var focus_arr = ['user', 'pass', 're-pass', 'phone', 'email'];

$(document).ready(function(){
    $("[data-toggle='tooltip']").tooltip();
    Bind_alert();
    $('#error-menu').children().remove();
    //Add Error Message
    $('#error-menu').append('<li><a>You are fucked!</a></li>');
    $('#fail_alert').removeClass('hide');
    set_focus();
});

function validator(value, name){
    switch(name){
		case 'user':
			if(username.test(value)) return true;
			else return false;
		case 'phone':
			if(phone.test(value)) return true;
			else return false;
		case 'pass':
			if(password.test(value)) return true;
			else return false;
		case 're-pass':
			if(value===$('#pass').val()) return true;
			else return false;
		default:
			if(mail.test(value)) return true;
			else return false;
	}
}

function validate(value, partName){
    $('#' + partName + '-tip').children().remove();
    if(!validator(value, partName)){
        if($('#' + partName).val() !== ''){
            $('#' + partName + '-tip').css('color', 'darkred');
			$('#' + partName + '-tip').append("<span>X</span>\n");
        }
    }else {
        $('#' + partName + '-tip').css('color', 'green');
		$('#' + partName + '-tip').append("<span>✔</span>\n");
    }
}

function set_focus(){
    focus_arr.forEach(function(item){
        $('#' + item).bind("input propertychange change", function(){
            console.log(item);
            if(item == 'pass' && $('#pass').val() === $('#re-pass').val()){
                $('#re-pass-tip').children().remove();
                $('#re-pass-tip').css('color', 'green');
                $('#re-pass-tip').append("<span>✔</span>\n");
            }
            validate($('#' + item).val(), item);
        });
    });
}

function Bind_alert(){
	$('#fail_alert').bind('closed.bs.alert', function(){
		$('#alert').append("<div id='fail_alert' class='alert alert-danger hide'><button href='#' class='close' data-dismiss='alert'> &times;</button><button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='down'> 错误！ 注册用户时出错！！ <span class='caret'></span></button><ul class='dropdown-menu' role='menu' id='error-menu'></ul>");
	});
}