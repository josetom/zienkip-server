var console = require('console');
//var uuid = require('uuid');
var app = require('../app');
//var query = require('couchbase').N1qlQuery;

function Database() {};
 
module.exports = Database;

Database.get = function (bucket, documentId, callback) {
    app.buckets[bucket].get(documentId, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, {message: "success", data: result});
    });
};

Database.getMulti = function(bucket, documentIdArray, callback) {
    app.buckets[bucket].getMulti(documentIdArray, function(error, result) {
        if(error) {
            callback(error, {message: "failure", data: result});
            return;
        }
        callback(null, {message: "success", data: result});
    });
};

Database.upsert = function(bucket, jsonData, callback) {
    var documentId = jsonData.id;
    if(documentId) {
        upsert(bucket, documentId, jsonData, callback);
    } else {
        app.buckets[bucket].counter(jsonData.type, 1, {initial:1}, function(err, res) {
        if (err) {
            callback(err, null);
            return;
        }
        documentId = jsonData.type+'_'+res.value;
        jsonData.id = documentId;
        upsert(bucket, documentId, jsonData, function(error, result) {
            if(error) {
                callback(error, null);
                return;
            }
            callback(null, {message: "success", data: result});
            });
        });
    }
};

var upsert = function(bucket, documentId, value, callback) {
    app.buckets[bucket].upsert(documentId, value, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, {message: "success", data: result});
    });
};