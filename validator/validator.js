'use strict';

var config  = require('../config');
var utils   = require('../utils/utils');

function Validator() {};

module.exports = Validator;

var defaults = {};

defaults.type = 'kip';
defaults.user_score = 0;
defaults.browser_version = config.browser_version;

Validator.validateNewUser = function (document) {
    var isValid = true;
    var store_content = {};
    var error = {};
    
    if(!document.pwd) {
        isValid = false;
        error.pwd = "invalid password";
    } else {
        store_content.pwd = utils.generateHash(document.pwd);
        delete document.pwd;
    }
    
    if(!document.fname) {
        isValid = false;
        error.fname = "invalid first name";
    }
    
    if(!document.lname) {
        isValid = false;
        error.lname = "invalid lastname";
    }
    
    if(!document.email || !this.validateEmail(document.email)) {
        isValid = false;
        error.emails = "invalid email";
    } else {
        document.email = [document.email];
    }
    
    if(!this.validateMobileNumber(document.mobile)) {
        isValid = false;
        error.mobile = "invalid mobile number";
    } 
    
    //add the default fields
    var key;
    for (key in defaults) {
        if(!document[key]) {
            document[key] = defaults[key];
        }
    }
    
    return {isValid: isValid, document: document, error: error, store_content: store_content};
};
        
Validator.validateEmail = function (email) {
    var re = /^[a-zA-Z0-9._]+@[a-zA-Z0-9._]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
};

Validator.validateMobileNumber = function (mobile) {
    var re = /^\+\d{1,3}-\d{9,10}$/;
    return re.test(mobile);
};