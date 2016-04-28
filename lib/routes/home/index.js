'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');

var router = express.Router();

// Display all blog posts
router.get('/', stormpath.getUser, function(req, res, next) {
  req.app.get('stormpathApplication').getAccounts(function(err, accounts) {
    if (err) return next(err);

    var blogPosts = [];

    accounts.each(function(account, cb) {
      account.getCustomData(function(err, data) {
        if (err) return next(err);

        if (data.blogPosts) {
          Array.prototype.push.apply(blogPosts, data.blogPosts);
        }

        cb();
      });
    }, function() {
      res.render('home', { blogPosts: blogPosts });
    });
  });
});

module.exports = router;
