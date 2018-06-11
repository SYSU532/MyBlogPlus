/* Created by Palette at 2018/02/03 */

window.onload = function(){
	$('#login').click(ToIndex);
	$('#logup').click(ToSignup);
}

function ToIndex(){
	var name = $('#user').val(), pass = $('#pass').val();
	var error_flag = "";
	$.post('/', {'name': name, 'pass': pass})
	.done(
		function(data, status){
			if(data==='1'||data==='2'){
				error_alert(data);
			}else {
				window.location.href = '/?username=' + name;
			}
		}
	);
}

function ToSignup(){
	window.location.href = '/signup';
}

function error_alert(mess){
	Bind_alert();
	$('#error-menu').children().remove();
	var message = '';
	if(mess==='1'){
		message = '用户不存在!';
	}else {
		message = '输入密码错误!';
	}
	$('#error-menu').append('<li><a>' + message + '</a></li>' );
	$('#fail_alert').removeClass('hide');
}

function Bind_alert(){
	$('#fail_alert').bind('closed.bs.alert', function(){
		$('#alert').append("<div id='fail_alert' class='alert alert-danger hide'><button href='#' class='close' data-dismiss='alert'> &times;</button><button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='down'> 错误！ 登录时出错！！ <span class='caret'></span></button><ul class='dropdown-menu' role='menu' id='error-menu'></ul>");
	});
}