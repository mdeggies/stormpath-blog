'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');

var router = express.Router();

// List all bloggers and their blog post count
router.get('/', stormpath.loginRequired, function(req, res, next) {
  var userData = [];

  req.app.get('stormpathApplication').getAccounts(function(err, accounts) {
    if (err) return next(err);

    accounts.each(function(account, cb) {
      account.getCustomData(function(err, data) {
        if (err) return next(err);

        if (data.blogPosts && data.blogPosts.length > 0) {
          userData.push({
            username: account.username,
            numPosts: data.blogPosts.length
          });
        }
        cb();
      });
    }, function() {
      return res.render('bloggers', { userData: userData, admin: req.user.customData.admin });
    });
  });
});

// Display all of a user's blog posts
router.get('/:username', stormpath.loginRequired, function(req, res, next) {
  var username = req.params.username;

  req.app.get('stormpathApplication').getAccounts({ username: username }, function(err, accounts) {
    if (err) return next(err);

    var account = accounts.items[0];
    account.getCustomData(function(err, data) {
      if (err) return next(err);

      return res.render('blogPosts', { blogPosts: data.blogPosts, username: username });
    });
  });
});

// Render the profile page
router.get('/:username/profile', stormpath.loginRequired, function(req, res, next) {
  res.render('profile', { blogPosts: req.user.customData.blogPosts, admin: req.user.customData.admin });
});

// Admins can create a blog post for themselves or any other user
// Regular users can create a blog post for themselves only
router.post('/:username/profile', bodyParser.urlencoded({ extended: false }), stormpath.loginRequired, function(req, res, next) {
  if (req.user.customData.admin && req.body.author) {
    req.app.get('stormpathApplication').getAccounts({ username: req.body.author }, function(err, accounts) {
      if (err) return next(err);

      if (accounts.items.length === 0) {
        return next(new Error('No user found.'));
      }

      var account = accounts.items[0];
      account.getCustomData(function(err, customData) {
        if (err) return next(err);

        customData.blogPosts.push({
          username: account.username,
          date: new Date().toLocaleDateString(),
          name: account.fullName || account.surname,
          title: req.body.title,
          content: req.body.content,
          tags: req.body.tags.split(',')
        });

        customData.save(function(err) {
          if (err) return next(err);

          return res.redirect('/bloggers');
        });
      });
    });
  } else {
    req.user.customData.blogPosts.push({
      username: req.user.username,
      date: new Date().toLocaleDateString(),
      name: req.user.fullName || req.user.surname,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags.split(',')
    });
    req.user.customData.save(function(err) {
      if (err) return next(err);

      return res.render('profile', { blogPosts: req.user.customData.blogPosts, admin: req.user.customData.admin});
    });
  }
});

// Display a single blog post from a user
router.get('/:username/:id', stormpath.loginRequired, function(req, res, next) {
  var username = req.params.username;
  var id = parseInt(req.params.id);

  req.app.get('stormpathApplication').getAccounts({ username: username }, function(err, accounts) {
    if (err) return next(err);

    var account = accounts.items[0];
    account.getCustomData(function(err, data) {
      if (err) return next(err);

      if (data.blogPosts[id]) {
        return res.render('blogPost', { blogPost: data.blogPosts[id], username: username });
      }

      return res.redirect('/bloggers');
    });
  });
});

// Delete a user's account
router.get('/:username/delete/account', stormpath.loginRequired, function(req, res, next) {
  req.app.get('stormpathApplication').getAccounts({ username: req.params.username }, function(err, accounts) {
    if (err) return next(err);

    var account = accounts.items[0];
    account.delete(function(err) {
      if (err) return next(err);

      return res.redirect('/');
    });
  });
});

// Remove a blogger's post
router.delete('/:username/delete/:index', stormpath.loginRequired, function(req, res, next) {
  // Can't remove by passing in blogPosts[id] to remove(), have to splice instead
  req.user.customData.blogPosts.splice(req.params.index, 1);
  req.user.customData.save(function(err) {
    if (err) return next(err);

    res.end();
  });
});

module.exports = router;
