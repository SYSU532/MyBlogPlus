 //index.js


 Vue.use(VueRouter);
 Vue.use(VueResource);

$(document).ready(function(){
    $('#home-btn').css('background-color', 'white');
    
       setTimeout(function() {
        toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.success('A website for blogs and talks~', 'Welcome to MyBlog+');
    });
    $(".post-item").click(function(){
        window.location.href = '/details';
    });
        initList();
});

let vuePostList = new Vue({
   el: '#postList',
   data: {
       items: []
   }
});

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

const allPostAPI = "/allPostID";
const getPostAPI = "/data";
let postIDs = [];

function initList() {
    vuePostList.$http.post(allPostAPI).then(function (response) {
        postIDs = response.body.postIDs;
        for (let id of postIDs) {
            vuePostList.$http.post(getPostAPI, {id: id}).then(function (response) {
                if (response.body.code === 0) {
                    myAlert("Loading Error", response.body.errMessage);
                }
                else if (response.body.code === 1) {
                    let newPost = {};
                    newPost.title = response.body.title;
                    newPost.editor = response.body.editor;
                    newPost.content = response.body.content;
                    newPost.thumbs = response.body.thumbs;
                    vuePostList.items.push(newPost);
                }
            })
        }
    })
}

