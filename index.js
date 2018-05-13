var linebot = require('linebot');
var express = require('express');

var bot = linebot({
    channeelId:"1580035125",
    channelSecret:"837ed98e764e98030e2df9790645910f",
    channnelAccessToken:"oFLYRsUpU+DvjkyL+7G1byY857G3tTascM5oU4J1bsyHsMuqQnydbBU864GRXqGDF7xFvwu64T/RrO64+cai0dY7Th5yno/goN9+dJVa4EsuQuQRhMxueOGdALIqZsNcaP5YOK+mY49B320jCS3BRQdB04t89/1O/w1cDnyilFU="
});
//update Token after 24 hr past


//event will like:
/**
 * 
{ type: 'message',
  replyToken: 'xxxxxxx',
  source: 
    { userId: 'xxxxxxx',
      type: 'user',
      profile: [Function] },
  timestamp: 1484472609833,
  message: 
    { type: 'text',
      id: 'xxxxxxxxxx',
      text: 'hihi',
      content: [Function] },
  reply: [Function] }
}
 */

//------------check conn-------------
/**bot.on('message',(event)=>{
    console.log(event);
});**/
//--------------deal with mess-------------
bot.on('message',(event)=>{
    if(event.message.type = 'text'){
        var msg = event.message.text;
        event.reply(msg).then((data)=>{
            //success
            console.log(msg);
        }).catch((error)=>{
            //error
            console.log('error');
        });        
    }
});

const app = express(); //建立一個express 伺服器
const linebotParser = bot.parser();
app.post('/' , linebotParser); // POST 方法

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen((process.env.PORT || 8080), function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//!!!
