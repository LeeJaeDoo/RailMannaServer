var express = require('express');
var router = express.Router();

var pool = require('../libs/dbConnect.js').connect();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next){
  req.body.id = ;
  req.body.username = ;
  req.body.gender = ;
  req.body.bf = ;
  req.body.gf = ;
  req.body.say = ;
  pool.getConnection(function, (err, connection)){
    connection.query('SELECT '){

        }
  }
})

module.exports = router;
