var express = require('express');
var request = require('request');
const querystring = require('querystring');
const [AngleToken,MasterToken,HallToken,InfoToken] = [
    'JeHZW0fzS1rQX9yHvGRz0ZZqC+ENFDhsf/30grCHGk80MBiNjqDz76oj+ETgTnAXPjFCp/P/1EzYYbq4Ptz6U8tLCUxBHBlLeH4iozbORQOq1zYSc2cKosq8esu3/ttrZdeRRo0wsBoWI4gjTeEjuQdB04t89/1O/w1cDnyilFU=', 
    'BOpCS2JXlx/6DfqGmLVD9vU8FmjviF0TV/QJoLfkN0C465BHYiKtyfzP1Ov4wEIcF7xFvwu64T/RrO64+cai0dY7Th5yno/goN9+dJVa4EsLoNC5JV4mYF7ROws6Og6vfHByaSO/qQRZR8sy5Bz/twdB04t89/1O/w1cDnyilFU=',  
    'chRfdlc9nHQJyi8BLGXxExjrfNoGBMfH8DPqevbDaPYsgvP1WsZ8Aqi17HRS4dpfjtSLU5QD3G6b/RjZ4GflCh4N/hIhqWhBPPUJ56dhzxAfqRtgSPYadNTsTbcV/Hm1l4YUiJHYoDqaWO2o2qY/yAdB04t89/1O/w1cDnyilFU=',
    'bE7q3TnTG/MO9rE+0sME3betLgGFgqUpYCOv0OrmW/Uefjldl9a5am6xNyC0VRcnL87qKx1GMoPzGLKQDX/PRiERLTdZ2uIf5txK+1+JhIFsSIGwI00lGGaGavvCzkyKfy5A6QrqWZdfeu0J08SJDAdB04t89/1O/w1cDnyilFU='
  ]
var CHANNEL_ACCESS_TOKEN = HallToken;

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.use(express.static(__dirname)); //get every file

app.post('/' , loginParser); // POST 方法**/
app.post('/form',FormReceiver);
app.get('/formhtml',FormGiver);
app.post('/img',imgReceiver);
//app.get('/uploadhtml',UploadPage_giver)
app.post('')
/**
 * expected result:
 *  user:@ok     
 *  bot:googleform
 *  user:done
 * 
 */

//SQL
/**
     angle_nickname |   angle_id    | master_nickname |  master_id   | department | email              | give_id | head_url |self_intro|name  |phone       | received_intro? |score
    ----------------+---------------+-----------------+--------------------------------------------------------------------------------------------------------------------------------------
    友安            | 0123456789012 | 主人             | 123456789012 | phys/psy   |xu.6u.30@gmail.com   | bool   |url      |longtext  |劉友安 |0926372361  | bool            |0
    /
*/  

//login message with recpt function:
function create_member(email,line_id){

    return new Promise( (resolve,reject)=>{
        psql("SELECT * FROM ACCOUNT WHERE email=\'" + email +"\';").then(        

            (recpt)=>{
                if(recpt.length==0){
                    reject();
                }else{
                    psql("UPDATE ACCOUNT SET angle_id=\'"+ line_id +"\' WHERE email=\'" + email +"\';");
                    resolve();
                }
            }  
        );  
    });    
}

function psql(command){
   
    return new Promise((resolve,reject)=>{
        //while(is_conn_psql){console.log("(psql):pararell gate");};
        //if(!is_conn_psql){client.connect();is_conn_psql = true;}
        let recpt =[];
        let error;
        console.log("(psql):" + command );
        pool.connect()
        .then(client=>{            
            client.query(command)
            .then(res => {
                client.release();
                for (let row of res.rows) {                
                    recpt.push(row);
                    console.log( "(psql-query):"+ JSON.stringify(row));
                }
                resolve(recpt);
                for(let row of recpt){
                    console.log( "(psql-query-recpt):"+ JSON.stringify(row));
                }
                console.log( "(psql-query-recpt):"+ recpt.length);    
            })
            .catch(e => {client.release(); console.error("(psql):" + e.stack);reject(e);});            
        });
    });
    
    
}

function loginParser(req ,res){
    //route
    var nwimg;
    const domain="https://angleline-hall.herokuapp.com";  
    var adrr="/";
    
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
            
            if(true){
                
                psql("SELECT * FROM ACCOUNT WHERE line_id=\'" + line_id +"\';")
                .then( recpt =>{
                    if( recpt.length == 0)   
                    {
                        if(post.events[0].message.type == 'text'){
                            var email = post.events[0].message.text;
                            psql("SELECT * FROM ACCOUNT WHERE email=\'" + email +"\';").then(recpt=>{
                                if( recpt.length == 0 )
                                {
                                    let msg =[];
                                    let text ={
                                        "type":"text",
                                        "text":""
                                    }
                                    
                                    create_member(email,line_id)
                                    .then(
                                        ()=>{
                                            text.text ="成功註冊!";
                                            msg.push(text);
                                            var ad_msg_angle = {  
                                                "type": "flex",
                                                "altText": "this is a flex message",
                                                "contents":
                                                    {
                                                        "type": "bubble",
                                                        "header": {
                                                        "type": "box",
                                                        "layout": "vertical",
                                                        "contents": [
                                                            {
                                                            "type": "text",
                                                            "text": "按按鈕加小天使為好友"
                                                            }
                                                        ]
                                                        },
                                                        "hero": {
                                                            "type": "image",
                                                            "url": "https://i.imgur.com/4Ut09xB.jpg", //use 圖片位址
                                                        } ,
                                                        "footer": {
                                                          "type": "box",
                                                          "layout": "vertical",
                                                          "contents": [
                                                            {
                                                              "type": "spacer",
                                                              "size": "xl"
                                                            },
                                                            {
                                                              "type": "button",
                                                              "action": {
                                                                "type": "uri",
                                                                "label": "按我加好友",
                                                                "uri": "https://line.me/R/ti/p/%40ugr1160s"
                                                              },
                                                              "style": "primary",
                                                              "color": "#ff3333"
                                                            }
                                                          ]
                                                        }             
                                                    }
                                            };
                                            var ad_msg_master = {  
                                                "type": "flex",
                                                "altText": "this is a flex message",
                                                "contents":
                                                    {
                                                        "type": "bubble",
                                                        "header": {
                                                        "type": "box",
                                                        "layout": "vertical",
                                                        "contents": [
                                                            {
                                                            "type": "text",
                                                            "text": "按按鈕加小主人為好友"
                                                            }
                                                        ]
                                                        },
                                                        "hero": {
                                                            "type": "image",
                                                            "url": "https://i.imgur.com/vQB9JKi.jpg", //use 圖片位址
                                                        } ,
                                                        "footer": {
                                                          "type": "box",
                                                          "layout": "vertical",
                                                          "contents": [
                                                            {
                                                              "type": "spacer",
                                                              "size": "xl"
                                                            },
                                                            {
                                                              "type": "button",
                                                              "action": {
                                                                "type": "uri",
                                                                "label": "按我加好友",
                                                                "uri": "https://line.me/R/ti/p/%40ugr1160s"
                                                              },
                                                              "style": "primary",
                                                              "color": "#ff3333"
                                                            }
                                                          ]
                                                        }             
                                                    }
                                            };
                                            var ad_msg_info = {  
                                                "type": "flex",
                                                "altText": "this is a flex message",
                                                "contents":
                                                    {
                                                        "type": "bubble",
                                                        "header": {
                                                        "type": "box",
                                                        "layout": "vertical",
                                                        "contents": [
                                                            {
                                                            "type": "text",
                                                            "text": "按按鈕加詢問站為好友"
                                                            }
                                                        ]
                                                        },
                                                        "hero": {
                                                            "type": "image",
                                                            "url": "https://i.imgur.com/xffIZIN.jpg", //use 圖片位址
                                                        } ,
                                                        "footer": {
                                                          "type": "box",
                                                          "layout": "vertical",
                                                          "contents": [
                                                            {
                                                              "type": "spacer",
                                                              "size": "xl"
                                                            },
                                                            {
                                                              "type": "button",
                                                              "action": {
                                                                "type": "uri",
                                                                "label": "按我加好友",
                                                                "uri": "https://line.me/R/ti/p/%40ugr1160s"
                                                              },
                                                              "style": "primary",
                                                              "color": "#ff3333"
                                                            }
                                                          ]
                                                        }             
                                                    }
                                            };
                                            msg.push(ad_msg_angle);
                                            msg.push(ad_msg_master);
                                            msg.push(ad_msg_info);
                                        }
                                    )
                                    .catch(
                                        ()=>{text.text ="還沒有填表單喔!";msg.push(text);}
                                    ).then(
                                        ()=>{replymessage([text]);}                                        
                                    );
                                    
                                }else{
                                    let text ={
                                        "type":"text",
                                        "text":""
                                    }
                                    text.text ="您似乎使用和他人相同的電子郵件，請換個郵件註冊!\n有問題請洽詢問站";
                                    replymessage([text]);                        
                                }
                            });
                        }else{
                            let text ={
                                "type":"text",
                                "text":""
                            }
                            text.text ="EASTER_EGG!請輸入正確訊息";
                            replymessage([text]);
                        }                        

                    }else{
                        
                            let text ={
                                "type":"text",
                                "text":"功能尚未開啟"
                            }
                            replymessage([text]); 
                                                 
                    }    
                });                
                            
            }
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
          if(post.events[0].message.type == 'image'){
                options.json.messages[0].originalContentUrl=(domain+adrr);
                options.json.messages[0].previewImageUrl=(domain+adrr);
                app.get(adrr,(req,res)=>{
                  //res.sendFile(__dirname+"/img.jpg");    
                  res.writeHead(200, {'Content-Type': 'image/jpeg' });
                  res.end(nwimg, 'binary');
                });
          }  
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

//-----------------html part --------------------------------
function FormGiver(req,res){
    res.sendFile(__dirname+'/Form/index.html');//Linux on server
}
/**function UploadPage_giver(req,res){
    res.sendFile(__dirname+'/Imgur-Upload-master/index.html');//Linux on server
}**/
function FormReceiver(req,res){
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    req.on('data', function(chunk){   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }                

    });
    
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){
        post = querystring.parse(post);    
        console.log(post);
        psql("INSERT INTO ACCOUNT (email) VALUES (\'"+ post.email +"\');").then(
            res =>{
                psql("UPDATE ACCOUNT SET angle_nickname=\'"+ post.nickname +"\' WHERE email=\'" + post.email +"\';");
                psql("UPDATE ACCOUNT SET department=\'"+ post.dept +"\' WHERE email=\'" + post.email +"\';");
                psql("UPDATE ACCOUNT SET self_intro=\'"+ post.self_intro +"\' WHERE email=\'" + post.email +"\';");
                psql("UPDATE ACCOUNT SET problem="+ Math.floor(6*Math.random()) +" WHERE email=\'" + post.email +"\';");
                psql("UPDATE ACCOUNT SET score=0 WHERE email=\'" + post.email +"\';");                
                psql("UPDATE ACCOUNT SET name=\'"+ post.name +"\' WHERE email=\'" + post.email +"\';"); 
                psql("UPDATE ACCOUNT SET phone=\'"+ post.phone +"\' WHERE email=\'" + post.email +"\';");  
            }
        );
        res.sendFile(__dirname+'/Imgur-Upload-master/index.html');
    });
        
}
function imgReceiver(req,res){
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    req.on('data', function(chunk){   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }                

    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){
        post = querystring.parse(post);    
        console.log(post);
        psql("UPDATE ACCOUNT SET times=\'"+ post.url +"\' WHERE email=\'" + post.email +"\';");        
    });
}