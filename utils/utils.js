'use strict';

var config  = require('../config');
var forge   = require('node-forge');
var Cookies = require('cookies');
var Buffer  = require('buffer/').Buffer;

var hasOwnProperty = Object.prototype.hasOwnProperty;

function Utils() {};

module.exports = Utils;

// hash password
Utils.generateHash = function (password) {
    if(password) {
        return forge.md.sha1.create().update(password).digest().toHex();
    }
    return password;
};

// cheks if the passed object is empty or not
Utils.isEmpty = function (obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

// generate session
Utils.addCookies = function (req, res, cookieContents) {
    var cookies = new Cookies( req, res, { "keys": config.hash_key } );
    var key;
    for(key in cookieContents) {
        cookies.set( key, this.encodeCookie(cookieContents[key]), { httpOnly: true, signed: false } );
    }
};

// clears all cookies
Utils.clearCookies = function (req, res, path) {
    var cookies = req.cookies;
    var cookie;
    for(cookie in cookies) {
        this.removeCookie(req, res, cookie, path);
    }
};

// remove the given cookie
Utils.removeCookie = function (req, res, cookieName, path) {
    if(path) {
        res.clearCookie(cookieName, {path: path});
    } else {
        res.clearCookie(cookieName, {path: '/'});
    }
};

// encodes the cookie value to base64 and then to hex
Utils.encodeCookie = function (value) {
    return this.encode(this.encode(value, config.encoding.base64), config.encoding.hex);
};

// decodes the cookie value
Utils.decodeCookie = function (value) {
    return this.decode(this.decode(value, config.encoding.hex), config.encoding.base64);
};

// encodes the value to the specified format
Utils.encode = function (value, format) {
    var encodedVal;
    if(value) {
        var b = new Buffer(value);
        encodedVal = b.toString(format);
    }
    return encodedVal;
};

// decodes the value from specified format
Utils.decode = function (value, format) {
    var decodedVal;
    if(value) {
        var b = new Buffer(value, format)
        decodedVal= b.toString();
    }
    return decodedVal;
};