// Logup.js

Vue.use(VueResource);

var username = /^[a-zA-Z][a-zA-z0-9\_]{5,17}/, phone = /^[1-9][0-9]{10}$/;
var mail = /^[a-zA-Z0-9\_\-]+@(([a-zA-Z0-9\_\-])+\.)+[a-zA-Z]{2,4}$/, password = /^[0-9a-zA-Z-_][0-9a-zA-Z-_]{5,11}$/;
var focus_arr = ['user', 'pass', 're-pass', 'phone', 'email'];
// User Update Image info
var imgType = '', image = '';

let regist = new Vue({
    el: '#info-area',
    data: {
        username: '',
        password: '',
        re_password: '',
        phone: '',
        email: '',
        apiUrl: '/logup'
    },
    headers: {
        'Content-Type': 'application/octet-stream'
    },
    mounted: function(){
        this.$nextTick(function(){
            $("[data-toggle='tooltip']").tooltip();
            set_focus();
            Bind_alert();
            // Initial Head Img
            imgType = '.jpg';
            image = new Image();
            image.src = 'img/user.jpg';
            // Head Img Update
            $('#head').click(function(){
                $('#updater').trigger('click');
            });
            $('#updater').change(function(){
                var $file = $(this);
                var fileObj = $file[0];
                if(fileObj && fileObj.files && fileObj.files[0]){
                    var filepath = $('#updater').val();
                    imgType = filepath.substring(filepath.lastIndexOf('.'), filepath.length).toLowerCase();
                    if(isImage(imgType)){
                        $("#head").attr('src', window.URL.createObjectURL(fileObj.files[0]));
                        image = new Buffer(fileObj.files[0]);
                    }else{
                        myAlert('Fatal Error', '<br>Please update correct image file!');
                    }
                }
            });
        })
    },
    methods: {
        regist: function(){
            // Basic binding
            $('#down').html('Regist Error !&nbsp;&nbsp;&nbsp;<span class="caret"></span>');
            // Format Check
            var formatResult = testPattern();
            if(formatResult.length !== 0){
                $('#error-menu').children().remove();
                formatResult.forEach(function(item){
                    $('#error-menu').append('<li><a>' + item + ' Format Error !</a></li>');
                });
                $('#fail_alert').removeClass('hide');
                return;
            }
            // Duplicate Check
            var sendParams = {name: this.username, pass: this.password, imgType: imgType, 
                              rePass: this.re_password, phone: this.phone, email: this.email, image: image};
            var extraUrl = '?name=' + this.username + '&pass=' + this.password + '&rePass=' + this.re_password 
                            + '&phone=' + this.phone + '&email=' + this.email + '&imgType=' + this.imgType;
            console.log(sendParams);
            this.$http.post(this.apiUrl + extraUrl, sendParams).then(function(response){
                console.log(response.body.code);
                if(response.body.code === 1){
                    window.location.href = '/index';
                    // Store session
                }else if(response.body.code === 0) {
                    var duplicateResult = response.body.errMessage.split('! ');
                    if(duplicateResult.length > 1){
                        $('#error-menu').children().remove();
                        $('#fail_alert').removeClass('hide');
                    }
                    duplicateResult.forEach(function(item){
                        if(item !== ''){
                            $('#error-menu').append('<li><a>' + item + '</a></li>');
                        }
                    });
                }
            });
        }
    }
});

function isImage(type){
    if(type == '.jpg' || type == '.jpeg' || type == '.png' 
            || type == '.gif' || type == '.ico'){
        return true;
    }else return false;
}

function testPattern(){
    var result = [], count = 0;
    var data_ = [$("#user").val(), $("#pass").val(), $("#re-pass").val(), $("#phone").val(), $("#email").val()];
    var Test = [username, password, phone, mail];
    var error_ = ['Username', 'Password', 'Phone', 'Email'];
    focus_arr.forEach(function(item){
        if(count == 2){
            if(data_[1] !== data_[2]) result.push('Again Password');
        }else {
            var Count = count;
            if(count >= 2) Count -= 1;
            if(!Test[Count].test(data_[count])) result.push(error_[Count]);
        }
        count++;
    });
    return result;
}

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