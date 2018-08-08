var express = require('express');
var request = require('request');
const querystring = require('querystring');
const game_item = require('./game_item.js');
const [AngleToken,MasterToken,HallToken,InfoToken] = [
    'JeHZW0fzS1rQX9yHvGRz0ZZqC+ENFDhsf/30grCHGk80MBiNjqDz76oj+ETgTnAXPjFCp/P/1EzYYbq4Ptz6U8tLCUxBHBlLeH4iozbORQOq1zYSc2cKosq8esu3/ttrZdeRRo0wsBoWI4gjTeEjuQdB04t89/1O/w1cDnyilFU=', 
    'BOpCS2JXlx/6DfqGmLVD9vU8FmjviF0TV/QJoLfkN0C465BHYiKtyfzP1Ov4wEIcF7xFvwu64T/RrO64+cai0dY7Th5yno/goN9+dJVa4EsLoNC5JV4mYF7ROws6Og6vfHByaSO/qQRZR8sy5Bz/twdB04t89/1O/w1cDnyilFU=',  
    'chRfdlc9nHQJyi8BLGXxExjrfNoGBMfH8DPqevbDaPYsgvP1WsZ8Aqi17HRS4dpfjtSLU5QD3G6b/RjZ4GflCh4N/hIhqWhBPPUJ56dhzxAfqRtgSPYadNTsTbcV/Hm1l4YUiJHYoDqaWO2o2qY/yAdB04t89/1O/w1cDnyilFU=',
    'bE7q3TnTG/MO9rE+0sME3betLgGFgqUpYCOv0OrmW/Uefjldl9a5am6xNyC0VRcnL87qKx1GMoPzGLKQDX/PRiERLTdZ2uIf5txK+1+JhIFsSIGwI00lGGaGavvCzkyKfy5A6QrqWZdfeu0J08SJDAdB04t89/1O/w1cDnyilFU='
  ]
var CHANNEL_ACCESS_TOKEN = MasterToken;
const modetype =["angle_id","master_id"];
const mode = modetype[1];
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
  
    var options = {
        url: "https://api.line.me/v2/bot/message/push",
        method: 'POST',
        headers: {
          'Content-Type':  'application/json', 
          'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN
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
                
                psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+member.master_id+"\';").then(
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
                        text2.text += game_item.locationproblem[angles[0].location_problem];
                        pushmessage([msg,self_intro,text],member['angle_id']);
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
                        text.text +=game_item.gameproblem[angles[0].problem];
                        text2.text += game_item.locationproblem[angles[0].location_problem];
                        pushmessage([msg,self_intro,text],member[mode]);
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