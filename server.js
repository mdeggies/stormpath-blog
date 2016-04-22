'use strict';

var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');

var routes = require('./lib/routes');

var app = express();

app.set('trust proxy',true);
app.set('view engine', 'jade');
app.set('views', './lib/views');
app.locals.siteName = 'Stormpath Blog';

console.log(__dirname + '/static');

// app.use(express.static(__dirname + '/static'));
app.use('/static', express.static(__dirname + '/static'))

console.log('Initializing Stormpath');

app.use(stormpath.init(app, {
  expand: {
    customData: true
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
    }
  }
}));

app.use('/', routes);

app.on('stormpath.ready', function() {
  console.log('Server ready...');
  app.listen(process.env.PORT || 3000);
});

// Display all blog posts
app.get('/', stormpath.getUser, function(req, res) {
  app.get('stormpathApplication').getAccounts(function(err, accounts) {
    accounts.each(function(account, cb) {
      account.getCustomData(function(err, data) {
        res.render('home', {blogPosts: JSON.stringify(data.blogPosts)});
        cb();
      });
    });
  });
});

// List all bloggers and their blog post count
app.get('/bloggers', function(req, res) {
  var usersData = {};
  app.get('stormpathApplication').getAccounts(function(err, accounts) {
    accounts.each(function(account, cb) {
      var username = account.username;
      account.getCustomData(function(err, data) {
        var numPosts = Object.keys(data.blogPosts).length;
        usersData[username] = numPosts;
        cb();
      });
    }, function() {
      res.render('bloggers', {usersData: usersData});
    });
  });
});

// Display all of a user's blog posts
app.get('/bloggers/:username', stormpath.getUser, function(req, res) {
  var username = req.params.username;
  app.get('stormpathApplication').getAccounts({username: username}, function(err, accounts) {
    if (!err) {
      var account = accounts.items[0];
      account.getCustomData(function(err, data) {
        res.render('userPosts', {blogPosts: JSON.stringify(data.blogPosts), username: username});
      });
    }
  });
});

// Display a single blog post from a user
app.get('/bloggers/:username/:blogId', function(req, res, next) {
  var username = req.params.username;
  var blogId = req.params.blogId;

  app.get('stormpathApplication').getAccounts({username: username}, function(err, accounts) {
    if (!err) {
      var account = accounts.items[0];
      account.getCustomData(function(err, data) {
        if (data.blogPosts[blogId]) {
          res.render('blogPost', {blogPost: data.blogPosts[blogId], username: username});
        }
      });
    }
  });
});
