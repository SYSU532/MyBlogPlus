// Login.js
$(document).ready(function(){
    Bind_alert();
    $('#error-menu').children().remove();
    //Add Error Message
    $('#error-menu').append('<li><a>You are fucked!</a></li>');
    $('#fail_alert').removeClass('hide');
});

function Bind_alert(){
	$('#fail_alert').bind('closed.bs.alert', function(){
		$('#alert').append("<div id='fail_alert' class='alert alert-danger hide'><button href='#' class='close' data-dismiss='alert'> &times;</button><button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='down'> 错误！ 登录时出错！！ <span class='caret'></span></button><ul class='dropdown-menu' role='menu' id='error-menu'></ul>");
	});
}