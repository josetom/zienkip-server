//http://query.pub.couchbase.com/tutorial/#index

var console = require('console');
var config  = require('../config');
var couchbase   = require('couchbase');
var n1ql    = require('couchbase').N1qlQuery;
var uuid    = require('uuid');
var q       = require('q');

function Database() {};
var buckets = {};
 
module.exports = Database;

//connects to the cluster and opens necessary buckets
Database.start = function () {
    console.log("connecting to couch db"); 
    
    var couchCluster = new couchbase.Cluster(config.couchbase.server);
    buckets.profiles = couchCluster.openBucket(config.couchbase.buckets.profiles);
    buckets.user_store = couchCluster.openBucket(config.couchbase.buckets.user_store);
    
    for (bucket in buckets) {
        console.log("opened bucket - " + bucket);
    }
    console.log("connected to couch db"); 
};

//generic N1ql query
Database.query = function(bucket, query_string, params) {
    
    var defer = q.defer();
    var query = n1ql.fromString(query_string);
    
    buckets[bucket].query(query, params, defer.makeNodeResolver());
    return defer.promise;
};

//generic insert
Database.insert = function(bucket, key, value, callback) {
    if(!key) {
        key = uuid.v4();   
    }
    buckets[bucket].insert(key, value, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, {message: "success", data: result});
    });
};

//delete a record from given bucket and key
Database.remove = function(bucket, key, callback) {
    
    buckets[bucket].remove(key, function(err,result){
        if (err) {
           callback(err, null);
            return;
        }
        callback(null, {message: "success", key: key});
    });
    
};


//-----------------------

Database.get = function (bucket, documentId, callback) {
    buckets[bucket].get(documentId, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, {message: "success", data: result});
    });
};

Database.getMulti = function(bucket, documentIdArray, callback) {
    buckets[bucket].getMulti(documentIdArray, function(error, result) {
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
        buckets[bucket].counter(jsonData.type, 1, {initial:1}, function(err, res) {
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
    buckets[bucket].upsert(documentId, value, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, {message: "success", data: result});
    });
};