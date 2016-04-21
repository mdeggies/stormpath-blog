'use strict';

var express = require('express');
var stormpath = require('express-stormpath');

var routes = require('./lib/routes');

var app = express();

app.set('trust proxy',true);
app.set('view engine', 'jade');
app.set('views', './lib/views');
app.locals.siteName = 'Stormpath Blog';

console.log('Initializing Stormpath');

app.use(stormpath.init(app, {
  expand: {
    customData: true
  },
  web: {
    register: {
      autoLogin: true,
      nextUri: '/profile'
    }
  }
}));

app.use('/', routes);

app.on('stormpath.ready',function () {
  console.log('Stormpath Ready');
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server listening on http://localhost:' + port);
});

app.get('/', stormpath.getUser, function(req, res) {
  // Display all blog posts on home page
  app.get('stormpathApplication').getAccounts(function(err, accounts) {
    accounts.each(function(account, cb) {
      account.getCustomData(function(err, data) {
        res.render('home', {blogPosts: JSON.stringify(data.blogPosts)});
        cb();
      });
    });
  });
});
