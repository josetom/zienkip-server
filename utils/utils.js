'use strict';

var forge   = require('node-forge');

function Utils() {};

module.exports = Utils;

// hash password
Utils.hashPassword = function (password) {
    if(password) {
        return forge.md.sha1.create().update(password).digest().toHex();
    }
    return password;
};