'use strict';

var q       = require('q');
var console = require('console');
var config  = require('../config');
var utils   = require('../utils/utils');
var db      = require('../db/couchbase');
var queries = require('../db/couch-queries');

function Utils() {};

module.exports = Utils;

Utils.login = function (req, res, cookieLogin, user, pwd) {
    
    var query;
    
    if(cookieLogin === true) {
        query = queries.cookieLogin;
    } else {
        query = queries.login;
    }
    
    db.query(config.couchbase.buckets.user_store, query, [user, pwd])
        .then(function (result) {
        
            if (!utils.isEmpty(result[0])) {
                //valid user
                utils.addCookies(req, res, {u: result[0][0].uuid, k:config.hash_key})
                res.json({status: true, type: 'login', data: result});
            } else {
                if(cookieLogin === true) {
                    //no cookies present
                    res.render('index', { title: 'Kipenzi' });
                } else {
                    //invalid user
                    res.json({status: false, type: 'invalid', message: 'invalid credentials'});
                }
            }
        }, function (error) {
            //db error
            console.log(error);
            res.json({status: false, type: 'q', message: 'please contact support', dev: error});
        }).catch(function (error) {
            //q error
            console.log(error.stack);
            res.json({status: false, type: 'q', message: 'please contact support', dev: error.stack});
        });
};


// cookie login util
Utils.cookieLogin = function (req, res) {
    var user = utils.decodeCookie(req.cookies.u);
    this.login(req, res, true, user);
};


// log out util
Utils.logout = function (req, res) {
    utils.clearCookies(req, res);
    res.json({status: true, type: 'logout', message: 'log out successful', dev: res._headers});
};