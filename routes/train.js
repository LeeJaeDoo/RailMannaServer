var express = require('express');
var router = express.Router();

var connection = require('../libs/dbConnect.js').connect();

router.get('/list', function(req, res, next) {
    var lineListSQL = 'select * from line_tb';
    var timeTableSQL = 'select * from train_time_tb';
    connection.query(lineListSQL, function(error, lineList) {
        if (error) {
            res.status(500).json({ lineTable: null, timeTable: null });
        } else {
            connection.query(timeTableSQL, function(error, timeList) {
                if (error) res.status(500).json({ lineTable: null, timeTable: null });
                res.status(200).json({ lineTable: lineList, timeTable: timeList });
            });
        }
    });
});

router.post('/up', function(req, res, next) {
    userTrainCheck(req.body, res);
});

//다른 열차에 등록된 유저인지 확인
var userTrainCheck = function(body, res) {
    var checkSQL = 'select kakao_id from user_train where kakao_id=?';
    var check_params = [body.kakao_id];
    connection.query(checkSQL, check_params, function(error, user) {
        if (error) {
            res.status(500).json({ result: false, train_num: null });
        } else {
            if (user[0] !== undefined) {
                res.status(200).json({ result: false, train_num: null });
            } else {
                userTrainEnroll(body, res);
            }
        }
    });
};

//유저를 해당 열차에 등록
var userTrainEnroll = function(body, res) {
    var upSQL = 'insert into user_train(kakao_id, day, start_station, start_time, arrive_station) values(?, ?, ?, ?, ?)';
    var up_params = [body.kakao_id, body.day, body.start_station, body.start_time, body.arrive_station];
    connection.query(upSQL, up_params, function(error, row) {
        if (error) {
            res.status(500).json({ result: false, train_num: null });
        } else {
            getTrainNum(up_params[2], up_params[3], res);
        }
    });
};

//유저가 등록한 열차번호(고유번호)를 리턴
var getTrainNum = function(station, time, res) {
    var getTrainNumSQL = 'select train_num from train_time_tb where start_station=? and start_time=?';
    var params = [station, time];
    connection.query(getTrainNumSQL, params, function(error, train_num) {
        if (error) {
            res.status(500).json({ result: false, train_num: null });
        } else {
            res.status(200).json({ result: true, train_num: train_num[0].train_num });
        }
    });
};

//해당 열차의 채팅방이 있으면 값을 보내주고 없으면 생성해서 보내줌
//profile에서 설정 정보를 먼저 가져옴
router.post('/room', function(req, res, next) {
    getUserType(req.body, res);
});

//유저의 성별을 파악하고, 동행자의 성별 설정 타입을 확인한다.
var getUserType = function(body, res) {
    var userTySQL = 'select gender, same_gender, other_gender from user where kakao_id=?';
    var params = [body.kakao_id];
    connection.query(userTySQL, params, function(error, user) {
        if (error) {
            console.log('1 : '+error);
            res.status(500).json({
                train_room_num: 0,
                user_list: null
            });
        } else {
            var myGender = user[0].gender;      //0:남성 or 1:여성
            var same = user[0].same_gender;     //0:동성 허용 or 1:동성 off
            var other = user[0].other_gender;   //0:이성 허용 or 1:이성 off
            var myType = 0; //0 : 모두 허용, 1: 동성만 허용, 2: 이성만 허용, 3: 둘다 off는 안드로이드에서 막을것
            if(same === 0) {
                myType = (other === 0) ? 0 : 1;
            } else if(same === 1) {
                myType = (other === 0) ? 2 : 3;
            }
            var ty;
            if(myType === 0) {
                ty = 0;
            } else if(myType === 1) {
                ty = (myGender === 0) ? 1 : 2;
            } else if(myType === 2) {
                ty = 0;
            }
            getTrainRoom(body, ty, res);
        }
    });
};

//타입과 열차번호에 맞는 채팅방을 가져옴
var getTrainRoom = function(body, ty, res) {
    var getRoomSQL = 'select * from room where train_num=? and ty=?';
    var params = [body.train_num, ty];
    connection.query(getRoomSQL, params, function(error, room) {
        if (error) {
            console.log('2 : '+error);
            res.status(500).json({
                train_room_num: 0,
                user_list: null
            });
        } else {
            if(!room[0]) {
                //var room_status = (room[0]) ? true : false; //방이 존재하는지 아닌지
                createRoom(body, ty, res);
            } else {
                getRoomUserList(body, room[0].room_num, res);
            }
        }
    });
};

//방이 없는 경우 생성
var createRoom = function(body, ty, res) {
    var insertSQL = 'insert into room(train_num, ty) values(?, ?),(?, ?),(?, ?)';
    var params = [body.train_num, 0, body.train_num, 1, body.train_num, 2];
    connection.query(insertSQL, params, function(error, rooms) {
        if (error) {
            console.log('3 : '+error);
            res.status(500).json({
                train_room_num: 0,
                user_list: null
            });
        } else {
            var list = [];
            getTrainRoom(body, ty, res);
        }
    });
};

//채팅방에 있는 유저 kakaoID와 nickname을 가져옴
var getRoomUserList = function(body, room_num, res) {
    var userListSQL = 'SELECT kakao_id, nickname FROM room_users JOIN user USING (kakao_id) WHERE room_num=?';
    var params = [room_num];
    connection.query(userListSQL, params, function(error, chatInfo) {
        if (error) {
            console.log('4 : '+ error);
            res.status(500).json({
                train_room_num: 0,
                user_list: null
            });
        } else {
            inRoom(body, room_num, chatInfo, res);
        }
    });
};

//room_users 테이블에 사용자를 insert
var inRoom = function(body, room_num, chatInfo, res) {
    var inSQL = 'insert into room_users(room_num, kakao_id) values(?, ?)';
    var params = [room_num, body.kakao_id];
    connection.query(inSQL, params, function(error, row) {
        if (error) {
            console.log('5 : '+ error);
            res.status(500).json({
                train_room_num: 0,
                user_list: null
            });
        } else {
            res.status(200).json({
                train_room_num: room_num,
                user_list: chatInfo
            });
        }
    });
};

module.exports = router;
