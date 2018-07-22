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
var CHANNEL_ACCESS_TOKEN = AngleToken;
const modetype =["angle_id","master_id"];
const mode = modetype[0];
const c_mode = modetype[1];

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.post('/' , sendParser); // POST 方法**/
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
            let give_button =
            {
                "type": "template",
                "altText": "找台手機開啟",
                "template": {
                    "type": "buttons",                            
                    "text": "謝謝您參加本次小天使與小主人，如果希望提供line資訊及聯絡電話給對方，可以按給~~",                            
                    "actions": [
                        {
                        "type": "postback",
                        "label": "給!",
                        "data": "give=1&phone="+member.phone+"&master_id="+member.master_id
                        }
                    ]
                }
            };

            pushmessage([give_button],member.angle_id);
        }
         
      }
  )

  function sendParser(req ,res){
    //route    
    
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
        var line_id = post.events[0].source.userId;
        if( post.events[0].source.type == 'group'){
            line_id = post.events[0].source.groupId;
        }
        let msg = post.events[0].message;                                    
        let type = msg.type;
        let msgid = msg.id;
         
        /**var userMessage = post.events[0].message.text;
        console.log(replyToken);
        console.log(userMessage);**/
        if (typeof replyToken === 'undefined') {
            return;
        }
  
      if (posttype == 'postback'){
  
          // record userId,reply_id pair
          let rawdata = post.events[0].postback.data;
          let data = querystring.parse(rawdata);
  
          if("give" in data) {
              
            let options = {
                url: 'https://api.line.me/v2/bot/profile/'+ line_id,
                method: 'GET',
                headers: {                
                'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN                  
                }               
            }
        
            // Start the request
        
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
        
                    let msg_to_master ={  
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents": {
                            "type": "bubble",
                            "header": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "你的小天使真實身分"
                                }
                              ]
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {//頭貼
                                  "type": "image",
                                  "originalContentUrl":body.pictureUrl ,
                                  "previewImageUrl":body.pictureUrl
                                },
                                {//暱稱
                                  "type": "text",
                                  "text": "line稱呼： "+body.displayName,
                                },                
                                {//自我介紹
                                    "type": "text",
                                    "text": "狀態： "+ body.statusMessage,
                                },
                                {//手機號碼
                                    "type":"text",
                                    "text":"手機號碼: "+data.phone  
                                }                
                              ]                  
                            }            
                        }
                    };
                    let msg_to_angle ={  
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents": {
                            "type": "bubble",
                            "header": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "你的小主人真實身分"
                                }
                              ]
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {//頭貼
                                  "type": "image",
                                  "originalContentUrl":body.pictureUrl ,
                                  "previewImageUrl":body.pictureUrl
                                },
                                {//暱稱
                                  "type": "text",
                                  "text": "line稱呼： "+body.displayName,
                                },                
                                {//自我介紹
                                    "type": "text",
                                    "text": "狀態： "+ body.statusMessage,
                                },
                                {//手機號碼
                                    "type":"text",
                                    "text":"手機號碼: "+data.phone  
                                }                
                              ]                  
                            }            
                        }
                    };
                    let text ={
                        "type":"text",
                        "text":"已經傳送!"
                    }
                    if(mode == 'angle_id'){

                        pushmessage([msg_to_master],data.master_id);
                        replymessage([text]);

                    }else{ //master_id
                        psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+ line_id +"\';").then(
                            angles =>{
                                pushmessage([msg_to_angle],angles[0].angle_id);
                                replymessage([text]); 
                            }
                        )
                    }
                }else{
                console.log("!!!!!error when recpt profile!!!!!");                
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
            
          request(options, function (error, response, body) {
              if (error) throw error;
              console.log("(line)");
              console.log(body);
          });
          
        }        
    });
  
  }
