'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');
var randomstring = require('randomstring');

var router = express.Router();

// Admins can create a new user's account
router.post('/createUser', bodyParser.urlencoded({ extended: false }), stormpath.groupsRequired(['admins']), function(req, res, next) {

  var account = {
    username: req.body.username,
    givenName: req.body.firstName,
    surname: req.body.lastName,
    email: req.body.email,
    password: randomstring.generate(32)
  };

  req.app.get('stormpathApplication').createAccount(account, function(err, createdAccount) {
    if (err) return next(err);

    createdAccount.save(function(err) {
      if (err) return next(err);

      // Send new user a password reset email
      req.app.get('stormpathApplication').sendPasswordResetEmail({ email: createdAccount.email }, function(err) {
        if (err) return next(err);

        // Set admin status
        if (req.body.admin === 'on') {
          createdAccount.customData.admin = true;
        } else {
          createdAccount.customData.admin = false;
        }

        createdAccount.customData.blogPosts = [];
        createdAccount.customData.save(function(err) {
          if (err) return next(err);
        });

        res.redirect('/bloggers');
      });
    });
  });
});

module.exports = router;
