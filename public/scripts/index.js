
// Basic setting - Form itself

var jq = $.noConflict();
/*jq('#send').click(function(){
jq(document).keypress(function(e) {
   jq('#send').click(function(){

         if(e.which == 13) {
            jq('#chatForm #message').val('');
        }
});
postmessage(uid, username, message.value);
});*/


jq('#chatForm').submit(function(){
    var textarea = jq('#chatForm pre');
    if(textarea.length) {
        textarea.scrollTop(textarea.height());
     }
});


// firebase chatting set

var config = {
    apiKey: "AIzaSyAul8Qp7N2ZIo38KovH6sI5n7il09V2oXs",
    authDomain: "reilro-24e18.firebaseapp.com",
    databaseURL: "https://reilro-24e18.firebaseio.com",
    storageBucket: "reilro-24e18.appspot.com",
    messagingSenderId: "794780963070"
};

firebase.initializeApp(config);


// KAKAO PARSED DATA
var Kakao = '{"train_room_num": 1,"user_list": [{"kakao_id": "dlwoen1","nickname": "haha"},{"kakao_id": "dlwoen9","nickname": "hoho"}]}';
var kakaoUserData= jq.parseJSON(Kakao);
var kakaoUserList = [];
for (var prop in kakaoUserData.user_list) {
    kakaoUserList.push(kakaoUserData.user_list[prop]);
}



//  var email = document.getElementById('email');
//  var pass = document.getElementById('pass');
var uid = document.getElementById('email');
var message = document.getElementById('message');
var username = document.getElementById('username');
var database = firebase.database();


//send message
document.getElementById('send').addEventListener('click', function() {
    // console.log(firebase.auth().currentUser);
    postmessage(uid, username, message.value);
});


//push message
function postmessage(uid, username, message) {
    var data = {
        username: username,
        uid: uid,
        message: message
    };
    var userREF = firebase.database().ref().child(kakaoUserData.train_room_num); // 방 넘버
    var newPostREF = userREF.push();
    newPostREF.update(data);
};

// message input process // 방 넘버 호출
firebase.database().ref().child(kakaoUserData.train_room_num).limitToLast(12).on("child_added", function(snapshot) {
    var DATAFROMSERVER = JSON.stringify(snapshot.val(), null, 3);
    var newData = DATAFROMSERVER.split("\"");

   console.log(newData);
   console.log(newData.length);
    for (var i = 0; i < newData.length; i++) {


          console.log(newData[i]);

        if (newData[i] == "message") {

         for (i=0; i < kakaoUserList.length; i++) {
             var undefinedUser =  "나 : " + newData[i + 2] + "\n";
               document.getElementById('data').append(undefinedUser);

         }


        } else if (newData[i] == "username") {
            var kakaoUser = document.getElementById('data').value + "Sender: " + newData[i + 2] + "\n"
            document.getElementById('data').append(kakaoUser);
        }

    }
});

// send friends request
document.getElementById('sendreq').addEventListener('click', function() {
    firebase.database().ref().child('UserPool').once("value", function(snapshot) {
        var DATAFROMSERVER = JSON.stringify(snapshot.val(), null, 3);
        var newData = DATAFROMSERVER.split("\"");
        var postion = 0;
        for (var i = 0; i < newData.length; i++) {
            if (newData[i] == document.getElementById('addfriend').value) {
                postion = i + 4;
                break;
            }
        }
        //check if already send the request
        firebase.database().ref().child('User').child(newData[postion]).once("value", function(snapshot) {
            if ((JSON.stringify(snapshot.val())).includes(firebase.auth().currentUser.email)) {
                alert("Dont spam request");
            } else {
                var data = {
                    Request: firebase.auth().currentUser.email
                };
                var userREF = firebase.database().ref().child('User').child(newData[postion]);
                var newPostREF = userREF.push();
                newPostREF.update(data);
            }
        });
    });
});

//accept friends

// firebase.auth().onAuthStateChanged(function(user){
//    var x = 0;
//    firebase.database().ref().child('User').child(user.uid).on("child_added", function(snapshot){
//     var DATAFROMSERVER = JSON.stringify(snapshot.val(),null,3);
//     var newData = DATAFROMSERVER.split("\"");
//         for (var i = 0; i < newData.length; i++) {
//               if (newData[i] == "Request") {
//                  var requestID = "requestEmail".concat(i.toString());
//                  var acceptID = "accept".concat(i.toString());
//                  var declineID = "decline".concat(i.toString());

//                  creatButtonAccept(acceptID,declineID,requestID,newData[i+2],user.uid,x);
//                  x++;
//               }else if (newData[i] == "Friend") {
//                var requestID = "requestEmail".concat(i.toString());
//                  var acceptID = "accept".concat(i.toString());
//                  var declineID = "decline".concat(i.toString());

//                  chatButton(acceptID,declineID,requestID,newData[i+2],user.uid,x);
//                  x++;
//               }
//         }
//     });
// });

function creatButtonAccept(button1, button2, requestID, requestData, userID, postion) {
    var para = document.createElement("P");
    var t = document.createTextNode(requestData);
    para.appendChild(t);
    para.setAttribute("id", requestID);
    document.getElementById("FriendsRequest").appendChild(para);

    var accept = document.createElement("Button");
    t = document.createTextNode("Accept");
    accept.appendChild(t);
    accept.setAttribute("id", button1);
    accept.addEventListener('click', function() {
        ADDFRIENDS(requestData, userID, postion);
    });
    document.getElementById('FriendsRequest').appendChild(accept);

    var decline = document.createElement("Button");
    t = document.createTextNode("Delete");
    decline.appendChild(t);
    decline.setAttribute("id", button2);
    decline.addEventListener('click', function() {
        DECLINEFRIENDS(requestData, userID, postion);
    });
    document.getElementById('FriendsRequest').appendChild(decline);
};

function chatButton(button1, button2, requestID, requestData, userID, postion) {
    var para = document.createElement("P");
    var t = document.createTextNode(requestData);
    para.appendChild(t);
    para.setAttribute("id", requestID);
    document.getElementById("FriendsRequest").appendChild(para);

    var accept = document.createElement("Button");
    t = document.createTextNode("Chat");
    accept.appendChild(t);
    accept.setAttribute("id", button1);
    accept.addEventListener('click', function() {
        //chat Function here...

    });
    document.getElementById('FriendsRequest').appendChild(accept);

    var decline = document.createElement("Button");
    t = document.createTextNode("Delete");
    decline.appendChild(t);
    decline.setAttribute("id", button2);
    decline.addEventListener('click', function() {
        DECLINEFRIENDS(requestData, userID, postion);
    });
    document.getElementById('FriendsRequest').appendChild(decline);
}

function ADDFRIENDS(requestData, uid, postion) {
    var key = [];
    firebase.database().ref().child('User').child(uid).on("child_added", function(snapshot) {
        key.push(snapshot.key);
    });

    firebase.database().ref().child('User').child(uid).child(key[postion]).remove();
    var data = {
        Friend: requestData
    };
    var userREF = firebase.database().ref().child('User').child(uid);
    var newPostREF = userREF.push();
    newPostREF.update(data);
    location.reload();

}

//decline friends
function DECLINEFRIENDS(requestData, uid, postion) {
    var key = [];
    firebase.database().ref().child('User').child(uid).on("child_added", function(snapshot) {
        key.push(snapshot.key);
    });
    firebase.database().ref().child('User').child(uid).child(key[postion]).remove();
    location.reload();
}
