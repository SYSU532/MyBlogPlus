 //index.js

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

            }, 500);
    
    $(".post-item").click(function(){
        window.location.href = '/details';
    });
});