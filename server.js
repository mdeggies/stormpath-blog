'use strict';

var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');

var routes = require('./lib/routes');

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
  web: {
    register: {
      view: path.join(__dirname, 'lib', 'views', 'register.jade'),
      uri: '/register',
      autoLogin: true,
      nextUri: '/profile',
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
      view: path.join(__dirname, 'lib', 'views', 'login.jade'),
      uri: '/login',
      nextUri: '/profile'
    },
    forgotPassword: {
      view: path.join(__dirname, 'lib', 'views', 'forgotPassword.jade'),
      uri: '/forgotPassword',
      nextUri: '/login'
    }
  }
}));

app.use('/', routes);

app.on('stormpath.ready', function() {
  console.log('Server ready...');
  app.listen(process.env.PORT || 3000);
});

// Display all blog posts
app.get('/', stormpath.getUser, function(req, res, next) {
  app.get('stormpathApplication').getAccounts(function(err, accounts) {
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

// List all bloggers and their blog post count
app.get('/bloggers', stormpath.loginRequired, function(req, res, next) {
  var userData = [];

  app.get('stormpathApplication').getAccounts(function(err, accounts) {
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
      return res.render('bloggers', { userData: userData });
    });
  });
});

// Display all of a user's blog posts
app.get('/bloggers/:username', stormpath.loginRequired, function(req, res, next) {
  var username = req.params.username;

  app.get('stormpathApplication').getAccounts({ username: username }, function(err, accounts) {
    if (err) return next(err);

    var account = accounts.items[0];
    account.getCustomData(function(err, data) {
      if (err) return next(err);

      return res.render('blogPosts', { blogPosts: data.blogPosts, username: username });
    });
  });
});

// Display a single blog post from a user
app.get('/bloggers/:username/:id', stormpath.loginRequired, function(req, res, next) {
  var username = req.params.username;
  var id = parseInt(req.params.id);

  app.get('stormpathApplication').getAccounts({ username: username }, function(err, accounts) {
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
