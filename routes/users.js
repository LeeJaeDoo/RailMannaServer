var express = require('express');
var router = express.Router();

var connection = require('../libs/dbConnect').connect();

/* GET users listing. */

//회원가입//duplication?kakao_id=asd
router.get('/duplication', function(req, res, next){
  var kakaoID = req.query.kakao_id;

  var sql = 'SELECT kakao_id FROM user WHERE kakao_id = ?';
  connection.query(sql, kakaoID, function(err, rows){
      if (err){
          console.error("err : " + err);
          res.status(500).json({result: false});
      } else {
          console.log("rows : " + JSON.stringify(rows));
          if(rows[0]) {   //이미 가입된 회원인 경우
              res.status(200).json({result: false});
          } else {         //처음 가입하는 경우
              res.status(200).json({result: true});
          }
      }
  });

});

router.post('/singUp', function(req, res, next) {
    var kakaoID = req.body.kakao_id;
    var nickname = req.body.nickname;
    var gender = req.body.gender;
    var same_gender = req.body.same_gender;
    var other_gender = req.body.other_gender;
    var say = req.body.say;
    connection.query('INSERT INTO user (kakao_id, nickname, gender, same_gender, other_gender, say) VALUES (?, ?, ?, ?, ?, ?);',
        [kakaoID, nickname, gender, same_gender, other_gender, say], function(err, rows){
        if(err)
            console.error("err : " + err);
        else
            res.status(200).json({result: true});
    });
});

//프로필 조회
router.get('/profile/:kakao_id', function(req, res){
  var kakaoID = req.params.kakao_id;
  var sql = 'SELECT nickname, gender, same_gender, other_gender, say FROM user WHERE kakao_id = ?';
  connection.query(sql, kakaoID, function(err, rows){
      if (err){
          console.error("err : " + err);
          res.status(500).json({result: false});
      } else{
          res.status(200).json({result: rows});
      }
  })
})

//프로필 수정
router.post('/profile', function(req, res){
  var kakaoID = req.body.kakao_id;
  var nickname = req.body.nickname;
  var gender = req.body.gender;
  var same_gender = req.body.same_gender;
  var other_gender = req.body.other_gender;
  var say = req.body.say;
  var sql = 'UPDATE user SET nickname=?, gender=?, same_gender=?, other_gender=?, say=? WHERE kakao_id=?';
  connection.query(sql, [nickname, gender, same_gender, other_gender, say, kakaoID], function(err, rows){
    if(err){
        console.error("err : " + err);
        res.status(500).json({result: false});
    }else{
        res.status(200).json({result: true});
    }
  })
})

//받은 쪽지함 리스트 조회
router.get('/msg/:receiver_id', function(req, res){
  var receiverID = req.params.receiver_id;
  var sql = 'SELECT sender_id, msg, time, read_count FROM msg_tb WHERE receiver_id = ? ORDER BY time DESC';
  connection.query(sql, receiverID, function(err, rows){
    if(err){
        console.error("err : " + err);
        res.status(500).json({result: false});
    }else{
        res.status(200).json({result: rows});
    }
  })
})

//메세지 전송
router.post('/msg', function(req, res){
  var senderID = req.body.sender_id;
  var receiverID = req.body.receiver_id;
  var msg = req.body.msg;
  var time = getCurrentTime();
  var sql = 'INSERT INTO msg_tb (sender_id, receiver_id, msg, time, read_count) VALUES (?, ?, ?, ?, 0)';
  connection.query(sql, [senderID, receiverID, msg, time], function(err, rows){
      if(err){
          console.error("err : " + err);
          res.status(500).json({result: false});
      }else{
          res.status(200).json({result: true});
      }
  })
})

var getCurrentTime = function() {
    var date = new Date();
    return twoDigits(date.getFullYear(), 4) + '-' + twoDigits(date.getMonth() + 1, 2) + '-' + twoDigits(date.getDate(), 2) + ' ' +
        twoDigits(date.getHours(), 2) + ':' + twoDigits(date.getMinutes(), 2) + ':' + twoDigits(date.getSeconds(), 2);
};

var twoDigits = function(str, digits) {
    var zero = '';
    str = str.toString();
    if (str.length < digits) {
        for (var i = 0; i < digits - str.length; i++)
            zero += '0';
    }
    return zero + str;
};

module.exports = router;
