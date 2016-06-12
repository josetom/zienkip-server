var console = require('console');
var express = require('express');
var router = express.Router();

/* Validate login. */
router.get('/', function (req, res, next) {
	var name = req.query.name;
  res.render('index', { title: name });
});

router.post('/', function (req, res, next) {
	
//            console.log(req);
            console.log(req.body.email);
            
    var email = req.body.email;
	var password = req.body.password;
            
	if(email == '1@2' && password == 'qwerasdf'){
            res.json({'status' : 'SUCCESS','type' :'login','session' : 'bh2g345hg3j4g5s78'});
	}else{
		  res.json({'status' : 'FAILURE','type' :'login'});
	}
  
});

module.exports = router;