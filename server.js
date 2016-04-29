'use strict';

var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');

var home = require('./lib/routes/home');
var bloggers = require('./lib/routes/bloggers');
var admins = require('./lib/routes/admins');

var app = express();

app.set('trust proxy', true);
app.set('view engine', 'jade');
app.set('views', './lib/views');

app.locals.siteName = 'Stormpath Blog';

app.use('/static', express.static(__dirname + '/static'))
app.use(stormpath.init(app, {
  expand: {
    customData: true
  },
  templateContext: {
    siteName: 'Stormpath Blog'
  },
  postRegistrationHandler(account, req, res, next) {
    // Set 'admin' field in each user's custom data
    req.user.getGroups({ name: 'admins' }, function(err, groups) {
      if (err) return next(err);

      if (groups.items[0]) {
        req.user.customData.admin = true;
      }
      else {
        req.user.customData.admin = false;
      }
      req.user.customData.save(function(err) {
        if (err) return next(err);
      });
      return next();
    });
    // Initialize blog posts array if it doesn't exist already
    if (!Array.isArray(req.user.customData.blogPosts)) {
      req.user.customData.blogPosts = [];
      req.user.customData.save(function(err) {
        if (err) return next(err);
      });
    } else {
      return next();
    }
  },
  web: {
    register: {
      view: path.join(__dirname, 'lib', 'views', 'register.jade'),
      autoLogin: true,
      form: {
        fields: {
          username: {
            enabled: true,
            label: 'Username',
            name: 'username',
            required: true,
            type: 'text'
          }
        }
      }
    },
    login: {
      view: path.join(__dirname, 'lib', 'views', 'login.jade')
    },
    changePassword: {
      enabled: true,
      view: path.join(__dirname, 'lib', 'views', 'changePassword.jade'),
      autoLogin: true
    },
    forgotPassword: {
      view: path.join(__dirname, 'lib', 'views', 'forgotPassword.jade')
    }
  }
}));

app.use('/', home);
app.use('/bloggers', bloggers);
app.use('/admins', admins);

app.on('stormpath.ready', function() {
  console.log('Server ready...');
  app.listen(process.env.PORT || 3000);
});
