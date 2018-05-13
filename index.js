var linebot = require('linebot');
var express = require('express');

var bot = linebot({
    channeelId:"1580035125",
    channelSecret:"837ed98e764e98030e2df9790645910f",
    channnelAccessToken:"BOpCS2JXlx/6DfqGmLVD9vU8FmjviF0TV/QJoLfkN0C465BHYiKtyfzP1Ov4wEIcF7xFvwu64T/RrO64+cai0dY7Th5yno/goN9+dJVa4EsLoNC5JV4mYF7ROws6Og6vfHByaSO/qQRZR8sy5Bz/twdB04t89/1O/w1cDnyilFU="
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
bot.on('message',(event)=>{
    console.log(event);
});
//--------------deal with mess-------------
/**bot.on('message', function(event) {
    if (event.message.type = 'text') {
      var msg = event.message.text;
      event.reply(msg).then(function(data) {
        // success 
        console.log(msg);
      }).catch(function(error) {
        // error 
        console.log('error');
      });
    }
});**/

setTimeout(function(){
    var userId = 'Ud8227c6ad00a55cf3a6b7f4fa4e5ac7e';
    var sendMsg = 'hello';
    bot.push(userId,sendMsg);
    console.log('send: '+sendMsg);
},5000);

const app = express(); //建立一個express 伺服器
const linebotParser = bot.parser();
app.post('/' , linebotParser); // POST 方法

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen((process.env.PORT || 8080), function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//!!!
