var express = require('express');
var request = require('request');
const querystring = require('querystring');
const token = require('./token.js');
const [AngleToken,MasterToken,HallToken,InfoToken] = [
    token.AngleToken,
    token.MasterToken,
    token.HallToken,
    token.InfoToken
]
var CHANNEL_ACCESS_TOKEN = AngleToken;
var fs = require('fs');
const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
    });
var DomParser = require('dom-parser');

const app = express(); //建立一個express 伺服器
app.post('/' , idleParser); // POST 方法**/

function idleParser(req ,res){
    //route
    //var nwimg;
    //var domain="https://angleline"+(mode=="angle_id")?"":"-master"+".herokuapp.com";  
    //var adrr="/";
    
    // 定义了一个post变量，用于暂存请求体的信息
    var post = '';     
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    req.on('data', function(chunk){   
        post += chunk;
    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){    
        post = JSON.parse(post);
        console.log(post.events[0]);
        var replyToken = post.events[0].replyToken;
        var posttype = post.events[0].type;
        /**var userMessage = post.events[0].message.text;
        console.log(replyToken);
        console.log(userMessage);**/
        if (typeof replyToken === 'undefined') {
            return;
        }        

        if (posttype == 'message'){            
            var msg = {
                "type":"text",
                "text":"抱歉，服務還沒開始!"
            }
            var msg2 = {
                "type":"text",
                "text":"有問題可以洽\"詢問台\"!"
            }
            replymessage([msg,msg2]);
        }
        function replymessage(recpt){ //recpt is message object
          var options = {
            url: "https://api.line.me/v2/bot/message/reply ",
            method: 'POST',
            headers: {
              'Content-Type':  'application/json', 
              'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN
            },
            json: {
                'replyToken': replyToken,
                'messages': recpt
            }
          };
            
          request(options, function (error, response, body) {
              if (error) throw error;
              console.log("(line)");
              console.log(body);
          });
          
        }        
    });

}
//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen((process.env.PORT || 8080), function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//!!!!!