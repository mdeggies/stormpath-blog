'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');

var router = express.Router();

router.get('/profile', stormpath.loginRequired, function(req, res) {
  // var id = req.user.href.split('/')[5];
  if (req.user.customData.blogPosts) {
    var blogPosts = req.user.customData.blogPosts;
    res.render('profile', {blogPosts: JSON.stringify(blogPosts)});
  }
  else {
    req.user.customData.blogPosts = {};
    req.user.customData.save(function (err) {
      if (err) {
        return next(err);
      }
    });
    res.render('profile');
  }
});

router.post('/profile', bodyParser.urlencoded({extended: false}), stormpath.loginRequired, function(req, res, next) {
  if ((req.body.title !== '') && (req.body.content !== '') && (req.body.tags !== '')) {
    console.log('inside post /profile');
    var name = req.user.fullName || req.user.surname;
    var date = new Date().toLocaleDateString();
    var id = 'blogPost'+ ((Object.keys(req.user.customData.blogPosts).length) +1);
    var tags = req.body.tags.split(',');
    req.user.customData.blogPosts[id] = {date: date, author: name, title: req.body.title, content: req.body.content, tags: tags};
    req.user.customData.save(function (err) {
      if (err) {
        return next(err);
      }
    });
  }
  res.render('profile');
});

module.exports = router;
