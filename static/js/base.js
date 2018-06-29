// Base.js

Vue.use(VueResource);

$(document).ready(function(){
    vueBase.$http.post('/myFriendRequest', {name: $("#user-name").children("strong").html()}).then(function(response){
        vueNum.number = 0;
        var result = response.body.requestUser;
        result.forEach(function(item){
            var newItem = {
                'username': item,
                'imageUrl': ''
            };
            vueBase.$http.post('/getUserInfo', {flag: true, name: item}).then(function(response){
                newItem.imageUrl = 'img/' + response.body.imageUrl;
                vueBase.m_items.push(newItem);
                vueNum.number++;
            });
        });
    });
});

let vueNum = new Vue({
    el: '#number',
    data: {
        number: 0
    }
})

let vueBase = new Vue({
    el: '#mails-menu',
    data: {
        m_items: [],
    },
    methods: {
        onClickMail: function(username){
            myConfirm('Request Dealing', '<br>Do you want to become friends with ' + username + '?', function(result){
                if(result){
                    myAlert('OK', '<br>You and ' + username + ' have become friends!');
                }else {
                    myAlert('OK', '<br>' + username + '\'s friends request has been removed~'); 
                }
                var isSearch = checkURL();
                if(isSearch){
                    vueMails.$http.post('/dealFriendRequest', {accept: result, requestUser: username, responseUser: $("#user-name").children("strong").html()}).then(
                        function(response){
                            clearMails0();
                            clearMails();
                            receiveMails0();
                            receiveMails0();
                        }
                    )
                }
            });
        }
    }
});

function checkURL(){
    var url = window.location.href;
    var pathname = url.substr(url.lastIndexOf('/'), url.length);
    console.log(pathname);
    if(pathname == '/search'){
        return true;
    }else return false;
}

function clearMails0(){
    vueBase.m_items = [];
}

function receiveMails0(){
    vueBase.$http.post('/myFriendRequest', {name: $("#user-name").children("strong").html()}).then(function(response){
        var mails = response.body.requestUser;
        vueNum.number = 0;
        mails.forEach(function(item){
            var newItem = {
                'username': item,
                'imageUrl': ''
            };
            vueBase.$http.post('/getUserInfo', {flag: true, name: item}).then(function(response){
                newItem.imageUrl = 'img/' + response.body.imageUrl;
                vueBase.m_items.push(newItem);
                vueNum.number++;
            });
        });
    });
}