var express = require('express');
var router  = express.Router();
var users_utils   = require('../utils/users-utils');

module.exports = router;

/* GET home page. */
router.get('/', function(req, res, next) {
    users_utils.cookieLogin(req, res);
//    res.render('index', { title: 'Kipenzi' });
});