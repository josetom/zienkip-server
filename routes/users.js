'use strict';

var console = require('console');
var express = require('express');
var router  = express.Router();
var uuid    = require('uuid');
var config  = require('../config');
var db      = require('../db/couchbase');
var utils   = require('../utils/utils');
var users_utils = require('../utils/users-utils');
var validator   = require('../validator/validator');

module.exports = router;

// create new user
router.post('/signup', function (req, res, next) {
    
    var doc          = JSON.parse(req.body.params);
    var validatedDoc = validator.validateNewUser(doc.data);
    
    if (validatedDoc.isValid === true) {
        var document = validatedDoc.document;
        
        var key = uuid.v4();
        
        // inserts the email[0] (since we expect email to be an array at db; at insertion only one value inserted) 
        // and mobile number to store first. 
        // if success, it means it already doesnt exist. continue creating the user
        // if unsuccessful, rollback
        db.insert(config.couchbase.buckets.user_store, validatedDoc.document.email[0], {uuid: key, type: 'email', pwd: validatedDoc.store_content.pwd}, function (error, result) {
            console.log('inserting to store : ' + validatedDoc.document.email[0]);
            if (error) {
                console.log('error while inserting : ' + validatedDoc.document.email[0] + " : " + error);
                res.json({status: false, type: 'db', message: 'email id : ' + validatedDoc.document.email[0] + ' already exists'});
                return;
            }

            //email successful, now add the mobile number
            db.insert(config.couchbase.buckets.user_store, validatedDoc.document.mobile, {uuid: key, type: 'mobile', pwd: validatedDoc.store_content.pwd}, function (error, result) {
                console.log('inserting to store : ' + validatedDoc.document.mobile);
                if (error) {
                    console.log('deleting already inserted email : ' + validatedDoc.document.email[0]);
                    
                    //mobile number exists; delete the inserted email id
                    db.remove(config.couchbase.buckets.user_store, validatedDoc.document.email[0], function (error, result) {
                        if (error) {
                            console.log('deleting ' + validatedDoc.document.email[0] + ' failed !!');
                            return;
                        }
                    });
                    
                    console.log('error while inserting : ' + validatedDoc.document.mobile + " : " + error);
                    res.json({status: false, type: 'db', message: 'mobile no : ' + validatedDoc.document.mobile + ' already exists'});
                    return;
                }

                //email and mobile successful - inserting the record
                db.insert(config.couchbase.buckets.profiles, key, validatedDoc.document, function (error, result) {
                    if (error) {
                        console.log('error creating user. Deleting records from store');
                        
                        //error while creating the user - delete the already added email and mobile from store
                        db.remove(config.couchbase.buckets.user_store, [validatedDoc.document.email[0], validatedDoc.document.mobile], function (error, result) {
                            if (error) {
                                console.log('deleting ' + validatedDoc.document.email[0] + ' or ' + validatedDoc.document.mobile + ' failed !!');
                            }
                        });
                        res.json({status: false, type: 'db', message: 'Error while creating user. Please try again later.', dev:  error});
                        return;
                    }
                    
                    res.json({status: true, uuid: key});
                });
                
            });
        });
        
    } else {
        console.log(validatedDoc.error);
        res.json({status: false, type: 'invalid', message: 'validation failed', rows: validatedDoc.error});
    }
});

// signin
router.post('/signin', function (req, res, next) {
    
    var doc = JSON.parse(req.body.params);
    var username = doc.username;
    var pwd = utils.generateHash(doc.pwd);
    
    users_utils.login(req, res, false, username, pwd);
});

// signout
router.post('/signout', function (req, res, next) {
    
    users_utils.logout(req, res);
});