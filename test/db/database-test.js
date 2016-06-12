var couchbase = require('couchbase').Mock;
var db = new couchbase.Cluster();
var bucket = cluster.openBucket();

bucket.upsert('testdoc', {name:'Frank'}, function(err, result) {
  if (err) throw err;

  bucket.get('testdoc', function(err, result) {
    if (err) throw err;

    console.log(result.value);
    // {name: Frank}
  });