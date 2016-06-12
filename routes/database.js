var console = require('console');
var db = require('../db/couchbase');
var express = require('express');
var router = express.Router();

// http://localhost:8765/db/get?bucket=profiles&document=admin_1
router.get('/get', function(req, res, next) {
	console.log(req.query);
    db.get(req.query.bucket,req.query.document, function(error, result){
        if(error) {
            res.render('index', { title: error});
        }
        console.log(result);
        if(result)  {
            res.render('table', { title: result.message + ' get', rows :result });
        } else {
            res.render('table', {title : 'null', rows : null});
        }
    });
});

// http://localhost:8765/db/getmulti?bucket=profiles&document={%22documents%22:%20[%22admin_1%22,%22admin_2%22]}
router.get('/getmulti', function(req, res, next) {
	console.log(req.query);
    
    var items = JSON.parse(req.query.document);
    console.log(items);
    
    db.getMulti(req.query.bucket, items.documents, function(error, results){
        if(error) {
            console.log(error);
            console.log(results);
//            res.render('index', { title: error});
        }
        if(results) {
            for(key in results.data) {
                console.log(key + ':' + results.data[key].value);
            }
            res.render('table', { title: results.message + ' get multi', rows :results.data });
        } else {
            res.render('table', {title : 'null', rows : null});
        }
    });
});

// http://localhost:8765/db/upsert?bucket=profiles&document={data":{"type":"admin", "name":"jose"}}
router.get('/upsert', function(req, res, next) {
	console.log(req.query);
    var document = JSON.parse(req.query.document);
    
    db.upsert(req.query.bucket, document.data, function(error, result){
        if(error) {
            res.render('index', { title: error});
        }
        console.log(result);
        if(result)  {
            res.render('table', { title: result.message + ' upsert', rows :result });
        } else {
            res.render('table', {title : 'null', rows : null});
        }
    });
});

router.get('/', function(req, res, next) {
            res.render('index', {title : 'Kipenzi'})
});

module.exports = router;