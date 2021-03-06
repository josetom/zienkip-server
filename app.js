var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var couchbase = require('couchbase');
var db = require('./db/couchbase');

var config = require('./config');
var index = require('./routes/index');
var users = require('./routes/users');
var database = require('./routes/database');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.start();

app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Headers', 'origin, authorization, X-Requested-With, content-type, accept');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods','*');
        res.header('Accept','*/*');
        res.header('Accept-Encoding','gzip, deflate, sdch');
        next();
        });


//filter
app.all('*',function(req,res,next){
    if(req) {//.isAuthenticated()){
        console.log(req.cookies);
        next();
    }else{
        next(new Error(401)); // 401 Not Authorized
    }
});

app.use('/', index);
app.use('/users', users);
app.use('/db', database);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
