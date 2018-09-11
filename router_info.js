var express = require('express');
var request = require('request');

const goal = "https://informationdesk.herokuapp.com/";

const app = express(); //建立一個express 伺服器
app.post('/' , Parser); // POST 方法**/

function Parser(req ,res){
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
        
        if (typeof replyToken === 'undefined') {
            return;
        }        
        replymessage();   
        function replymessage(){ //recpt is message object
            console.log(post)
            console.log(url)
            var options = {
                url: goal,
                method: 'POST',
                headers: {
                  'Content-Type':  'application/json',                  
                },
                json:post
              };
                
              request(options, function (error, response, body) {
                  if (error) throw error;
                  console.log("(line)");
                  console.log(body);
                  res.end("");
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