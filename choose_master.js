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
var fs = require('fs');
const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.post('/' , idleParser); // POST 方法**/

var dept ={
    'phys':[],
    'psy':[]
}

//1.send candidate:
psql("SELECT * FROM ACCOUNT;").then(
    members =>{
        
        for(let member of members){
            if(member.department=='phys'){
                dept['phys'].push(member);
            }else if(member.department=='psy'){
                dept['psy'].push(member);
            }else{
                console.log("department problem choose_master.js:33");
            }
        }

        for(let member of members){
            let a,b,c;
            let len = dept[member.department].length;
            a=Math.floor(Math.random()*len);
            len=Math.floor(len/2)-2;
            b=Math.floor((Math.random()*len+1)+a)%(members.length);
            c=Math.floor((Math.random()*len+1)+b)%(members.length);

            let to_id = member.angle_id;
            let index_arr = [a,b,c];
            for(let index of index_arr){
                let msg ={  
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
                              "text": "跟你有緣的小主人"
                            }
                          ]
                        },
                        "body": {
                          "type": "box",
                          "layout": "vertical",
                          "contents": [
                            {//頭貼
                              "type": "image",
                              "originalContentUrl":dept[member.department][index].head_url ,
                              "previewImageUrl":dept[member.department][index].head_url
                            },
                            {//暱稱
                              "type": "text",
                              "text": "暱稱： "+dept[member.department][index].nickname,
                            },                
                            {//自我介紹
                                "type": "text",
                                "text": "自我介紹： "+ dept[member.department][index].self_intro,
                            }                
                          ],
                          "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                      "type": "postback",
                                      "label": "我要這個小主人",
                                      "data":"master_id="+dept[member.department][index].angle_id+"&dept="+member.department,
                                      "text":"選了"
                                    },
                                    "style": "primary",
                                    "color": "#0000ff"
                                  }
                            ]
                          }
                        }            
                    }
                };

                pushmessage([msg],to_id);
            }
        }
        return Promise.resolve();
    }
).then(
    ()=>{
        app.post('/' , choose_Parser); // POST 方法**/
    }    
)

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
  function idleParser(req ,res){
    //route
    var nwimg;
    const domain="https://angleline.herokuapp.com";  
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
            var msg = {
                "type":"text",
                "text":"抱歉，現在不能傳一般訊息!"
            }
            var msg2 = {
                "type":"text",
                "text":"有問題可以洽\"詢問台\"!"
            }
            replymessage([msg,msg2]);
        }
        if(posttype == 'postback'){
            var msg = {
                "type":"text",
                "text":"抱歉，請等待系統完成程序(一會兒後)，再按下按鈕!"
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

//2.choose
function choose_Parser(req ,res){
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
            var line_id = post.events[0].source.userId;
            /**var userMessage = post.events[0].message.text;
            console.log(replyToken);
            console.log(userMessage);**/
            if (typeof replyToken === 'undefined') {
                return;
            } 

            if (posttype == 'postback'){
                var q = url.parse(req.url,true);
                console.log(q.query); //?dev_name=....&alarm=.....

                var data = q.query;
                var master_id = data.master_id;
                var department = data.dept;
                if( dept[department].find((ele)=>{return ele.angle_id=master_id}) == -1 ){

                    let a,b,c;
                    let len = dept[department].length;
                    if(len>3){
                        a=Math.floor(Math.random()*len);
                        len=Math.floor(len/2)-2;
                        b=Math.floor((Math.random()*len+1)+a)%(dept[department].length);
                        c=Math.floor((Math.random()*len+1)+b)%(dept[department].length);

                        let to_id = line_id;
                        let index_arr = [a,b,c];

                        for(let index of index_arr){
                            let msg ={  
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
                                        "text": "跟你有緣的小主人"
                                        }
                                    ]
                                    },
                                    "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {//頭貼
                                        "type": "image",
                                        "originalContentUrl":dept[member.department][index].head_url ,
                                        "previewImageUrl":dept[member.department][index].head_url
                                        },
                                        {//暱稱
                                        "type": "text",
                                        "text": "暱稱： "+dept[member.department][index].nickname,
                                        },                
                                        {//自我介紹
                                            "type": "text",
                                            "text": "自我介紹： "+ dept[member.department][index].self_intro,
                                        }                
                                    ],
                                    "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "button",
                                                "action": {
                                                "type": "postback",
                                                "label": "我要這個小主人",
                                                "data":"master_id="+dept[member.department][index].angle_id+"&dept="+department,
                                                "text":"選了"
                                                },
                                                "style": "primary",
                                                "color": "#0000ff"
                                            }
                                        ]
                                    }
                                    }            
                                }
                            };
            
                            pushmessage([msg],to_id);
                        }

                    }else{
                        for(let cand of dept[department]){
                            let msg ={  
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
                                        "text": "跟你有緣的小主人"
                                        }
                                    ]
                                    },
                                    "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {//頭貼
                                        "type": "image",
                                        "originalContentUrl":cand.head_url ,
                                        "previewImageUrl":cand.head_url
                                        },
                                        {//暱稱
                                        "type": "text",
                                        "text": "暱稱： "+cand.nickname,
                                        },                
                                        {//自我介紹
                                            "type": "text",
                                            "text": "自我介紹： "+ cand.self_intro,
                                        }                
                                    ],
                                    "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                                "type": "button",
                                                "action": {
                                                "type": "postback",
                                                "label": "我要這個小主人",
                                                "data":"master_id="+cand.angle_id+"&dept="+department,
                                                "text":"選了"
                                                },
                                                "style": "primary",
                                                "color": "#0000ff"
                                            }
                                        ]
                                    }
                                    }            
                                }
                            };
            
                            pushmessage([msg],to_id);
                        }
                    }                    

                }else{    
                    psql("UPDATE ACCOUNT SET master_id=\'"+ master_id +"\' WHERE angle_id=\'" + line_id +"\';");
                    dept[department].splice(dept[department].find((ele)=>{return ele.angle_id=master_id}),1);
                }
            }     
        });
    
    }