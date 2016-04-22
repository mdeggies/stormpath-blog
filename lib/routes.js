'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');

var router = express.Router();

router.get('/profile', stormpath.loginRequired, function(req, res) {
  var username = req.user.username;
  if (req.user.customData.blogPosts) {
    var blogPosts = req.user.customData.blogPosts;
    res.render('profile', {blogPosts: JSON.stringify(blogPosts), username: username});
  }
  else {
    req.user.customData.blogPosts = {};
    req.user.customData.save(function (err) {
      if (err) {
        return next(err);
      }
    });
    res.render('profile', {username: username});
  }
});

// Send new blog post to bloggers/username page, render profile
router.post('/bloggers/:username', bodyParser.urlencoded({extended: false}), stormpath.loginRequired, function(req, res, next) {
  if ((req.body.title !== '') && (req.body.content !== '') && (req.body.tags !== '')) {
    var username = req.params.username;
    var name = req.user.fullName || req.user.surname;
    var author = req.body.username;
    console.log('author:',author);
    var date = new Date().toLocaleDateString();
    var blogId = 'blogpost'+ ((Object.keys(req.user.customData.blogPosts).length) +1);
    var tags = req.body.tags.split(',');
    req.user.customData.blogPosts[blogId] = {username: username, blogId: blogId, date: date, author: author, name: name, title: req.body.title, content: req.body.content, tags: tags};
    req.user.customData.save(function(err) {
      if (err) {
        return next(err);
      }
    });
    res.render('profile');
    // res.render('home', {blogPosts: req.user.customData.blogPosts, username: username});
  }
  // res.render('home');
});

module.exports = router;
