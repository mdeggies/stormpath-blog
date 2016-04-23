'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');

var router = express.Router();

// Render the profile page
router.get('/profile', stormpath.loginRequired, function(req, res, next) {
  res.render('profile', { blogPosts: req.user.customData.blogPosts });
});

// Send new blog post to bloggers/username page & render profile
router.post('/profile', bodyParser.urlencoded({ extended: false }), stormpath.loginRequired, function(req, res, next) {
  if (Array.isArray(req.user.customData.blogPosts)) {
    req.user.customData.blogPosts.push({
      username: req.params.username,
      date: new Date().toLocaleDateString(),
      name: req.user.fullName || req.user.surname,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags.split(',')
    });
  } else {
    req.user.customData.blogPosts = [{
      username: req.params.username,
      date: new Date().toLocaleDateString(),
      name: req.user.fullName || req.user.surname,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags.split(',')
    }];
  }

  req.user.customData.save(function(err) {
    if (err) return next(err);

    res.render('profile', { blogPosts: req.user.customData.blogPosts });
  });
});

module.exports = router;
