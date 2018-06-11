'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      when('/addPost', {
        templateUrl: 'partials/addPost',
        controller: AddPostCtrl
      }).
      when('/readPost/:id', {
        templateUrl: 'partials/readPost',
        controller: ReadPostCtrl
      }).
      when('/editPost/:id', {
        templateUrl: 'partials/editPost',
        controller: EditPostCtrl
      }).
      when('/deletePost/:id', {
        templateUrl: 'partials/deletePost',
        controller: DeletePostCtrl
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  }]);

  window.onload = function(){
    
  }

  jQuery(function($) {
    $("#logout").click(function(){
      console.log("fuck");
      $.post("/logout", {})
      .done(
        function(data, status){
          window.location.href = "/";
        }
      )
    });

    $(".sidebar-dropdown > a").click(function(){
      $(this).next(".sidebar-submenu").slideDown(250);
        if ($(this).parent().hasClass("active")){
              $(".sidebar-dropdown").removeClass("active");
              $(this).parent().removeClass("active");
        }else{
            $(".sidebar-dropdown").removeClass("active");
            $(".sidebar-submenu").slideUp(250);
             $(this).parent().addClass("active");
        }

    });

     $("#toggle-sidebar").click(function(){
         $(".page-wrapper").toggleClass("toggled");	    
        });

       if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
               $(".sidebar-content").mCustomScrollbar({
                        axis:"y",
                        autoHideScrollbar: true,
                        scrollInertia: 300
                });
                $(".sidebar-content").addClass("desktop");

        }
});