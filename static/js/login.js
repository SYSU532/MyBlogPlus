// Login.js

Vue.use(VueRouter);
Vue.use(VueResource);

//force https
var targetProtocol = "https:";
if (window.location.protocol != targetProtocol)
    window.location.href = targetProtocol +
        window.location.href.substring(window.location.protocol.length);


function showError(message){
    Bind_alert();
    $('#error-menu').children().remove();
    //Add Error Message
    $('#error-menu').append(`<li><a>${message}</a></li>`);
    $('#fail_alert').removeClass('hide');
}

function Bind_alert(){
	$('#fail_alert').bind('closed.bs.alert', function(){
		$('#alert').append("<div id='fail_alert' class='alert alert-danger hide'><button href='#' class='close' data-dismiss='alert'> &times;</button><button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='down'> Login Error !<span class='caret'></span></button><ul class='dropdown-menu' role='menu' id='error-menu'></ul>");
	});
}


let signin = new Vue({
    el: '#info-area',
    data: {
        username: '',
        password: '',
        apiUrl: '/login'
    },
    methods: {
        login: function (){
            uname = this.username;
            pass = this.password;
            this.$http.post(this.apiUrl, {name: uname, pass: pass}).then(function (response) {
                if (response.body.code === 1) {
                    setTimeout(function(){
                        window.location.href = '/index';
                    }, 100);
                }
                else if (response.body.code === 0) {
                    showError(response.body.errMessage)
                }
            })
        }
    }
});
