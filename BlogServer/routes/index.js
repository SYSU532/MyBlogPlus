
/*
 * GET home page.
 */
var validator = require("../model/validator.js");
var session = require("express-session");

exports.index = function(request, response){
  var result = {};
  var name = validator.parseName(request.url);
  var r_name = request.session.name;
  result['username'] = name;
  if(typeof r_name === 'undefined'){
    if(typeof name === 'undefined')
      response.render("signin");
    else
      response.redirect("/");
  }else {
    if(typeof name === 'undefined'){
      response.redirect("/?username=" + r_name);
    }else {
      if(r_name === name){
        response.render("index", result);
      }else {
        response.render("/?username=" + r_name);
      }
    }
  }
};

exports.partials = function (request, response) {
  var name = request.params.name;
  response.render('partials/' + name);
};

exports.index_page = function(request, response){
  response.render('index');
}

exports.signup = function(request, response){
  response.render('signup');
}

exports.test = function(request, response){
  response.render('test');
}