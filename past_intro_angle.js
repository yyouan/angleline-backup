var express = require('express');
var request = require('request');
const querystring = require('querystring');
const game_item = require('./game_item.js');
const token = require('./token.js');
const [AngleTokens,MasterTokens,HallTokens,InfoTokens] = [
    [token.AngleToken,token.AngleToken_2],
    [token.MasterToken,token.MasterToken_2],
    [token.HallToken,token.HallToken_2],
    [token.InfoToken,token.InfoToken_2]
]
var CHANNEL_ACCESS_TOKEN = AngleTokens;
const modetype =["angle_id","master_id"];
const mode = modetype[0];
const c_mode = modetype[0];

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

//------------SQL----------------------

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
  
  function pushmessage(recpt,id){
    recpt.forEach(element => {
        console.log("pushmessage:"+element);
    });
    for(let token of CHANNEL_ACCESS_TOKEN){

        var options = {
            url: "https://api.line.me/v2/bot/message/push",
            method: 'POST',
            headers: {
              'Content-Type':  'application/json', 
              'Authorization':'Bearer ' + token
            },
            json: {
                "to": id.replace(/\s+/g, ""),
                'messages': recpt
            }
          };
            
          request(options, function (error, response, body) {
              if (error) throw error;
              console.log("(line)");
              console.log(body);
          });

    }
    
  
  }

  //------------main code------------------
  psql("SELECT * FROM ACCOUNT;").then(
      (members)=>{
          for(let member of members){

            let text ={
                "type":"text",
                "text":"QRcode遊戲問題\n"
            }
            let text2={
                "type":"text",
                "text":"地點遊戲問題\n"
            }

            if(mode == 'master_id'){
                
                psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+member.master_id+"\';").then(
                    (masters)=>{
                        var master = masters[0];
                        let bubble ={
                            "type": "bubble",
                            "header": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "你的小主人"
                                }
                              ]
                            },
                            "hero": {
                              "type": "image",
                              "url": master.head_url.replace(/\s+/g, ""),
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                
                                    {//暱稱
                                        "type": "text",
                                        "text": "暱稱： "+master.angle_nickname.replace(/\s+/g, ""),
                                      },                
                                      
                              ]
                            }
                            
                        };
                        
                        let self_intro={//自我介紹
                            "type": "text",
                            "text": "自我介紹： "+ master.self_intro,
                        }

                        let msg ={  
                            "type": "flex",
                            "altText": "大講堂有消息，請借台手機開啟",
                            "contents":bubble 
                        };
                        text.text +=game_item.gameproblem[member.problem];
                        text2.text += game_item.locationproblem[member.location_problem];
                        pushmessage([msg,self_intro,text,text2],member[mode]);
                    }
                ); 

            }else{
                psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+member.angle_id+"\';").then(
                    (angles)=>{
                        let bubble ={
                            "type": "bubble",
                            "header": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "你的小天使"
                                }
                              ]
                            },
                            "hero": {
                              "type": "image",
                              "url": angles[0].head_url.replace(/\s+/g, ""),
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                
                                    {//暱稱
                                        "type": "text",
                                        "text": "暱稱： "+angles[0].angle_nickname.replace(/\s+/g, ""),
                                      },
                              ]
                            }
                            
                        };
                        
                        let self_intro =                
                        {//自我介紹
                            "type": "text",
                            "text": "自我介紹： "+ angles[0].self_intro,
                        };

                        let msg ={  
                            "type": "flex",
                            "altText": "大講堂有消息，請借台手機開啟",
                            "contents":bubble 
                        };                        
                        text.text += game_item.gameproblem[angles[0].problem];
                        text2.text += game_item.locationproblem[angles[0].location_problem];
                        pushmessage([msg,self_intro,text,text2],member[mode]);
                    }
                );
            }

          }
        
        
      }
  )

  //idle.js

  const app = express(); //建立一個express 伺服器
  app.post('/' , idleParser); // POST 方法**/
  
  function idleParser(req ,res){
      //route
      var nwimg;
      var domain="https://angleline"+((mode=="angle_id")?"":"-master")+".herokuapp.com";  
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

            for(let token of CHANNEL_ACCESS_TOKEN){

                var options = {
                    url: "https://api.line.me/v2/bot/message/reply ",
                    method: 'POST',
                    headers: {
                      'Content-Type':  'application/json', 
                      'Authorization':'Bearer ' + token
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
            
          }        
      });
  
  }
  //因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
  var server = app.listen((process.env.PORT || 8080), function() {
      var port = server.address().port;
      console.log("App now running on port", port);
  });
  //!!!!!