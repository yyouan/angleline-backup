var express = require('express');
var request = require('request');
const querystring = require('querystring');
const [AngleToken,MasterToken,HallToken,InfoToken] = [
    'JeHZW0fzS1rQX9yHvGRz0ZZqC+ENFDhsf/30grCHGk80MBiNjqDz76oj+ETgTnAXPjFCp/P/1EzYYbq4Ptz6U8tLCUxBHBlLeH4iozbORQOq1zYSc2cKosq8esu3/ttrZdeRRo0wsBoWI4gjTeEjuQdB04t89/1O/w1cDnyilFU=', 
    'BOpCS2JXlx/6DfqGmLVD9vU8FmjviF0TV/QJoLfkN0C465BHYiKtyfzP1Ov4wEIcF7xFvwu64T/RrO64+cai0dY7Th5yno/goN9+dJVa4EsLoNC5JV4mYF7ROws6Og6vfHByaSO/qQRZR8sy5Bz/twdB04t89/1O/w1cDnyilFU=',  
    'chRfdlc9nHQJyi8BLGXxExjrfNoGBMfH8DPqevbDaPYsgvP1WsZ8Aqi17HRS4dpfjtSLU5QD3G6b/RjZ4GflCh4N/hIhqWhBPPUJ56dhzxAfqRtgSPYadNTsTbcV/Hm1l4YUiJHYoDqaWO2o2qY/yAdB04t89/1O/w1cDnyilFU=',
    'bE7q3TnTG/MO9rE+0sME3betLgGFgqUpYCOv0OrmW/Uefjldl9a5am6xNyC0VRcnL87qKx1GMoPzGLKQDX/PRiERLTdZ2uIf5txK+1+JhIFsSIGwI00lGGaGavvCzkyKfy5A6QrqWZdfeu0J08SJDAdB04t89/1O/w1cDnyilFU='
  ]
const game_item = require('./game_item.js');
const modetype =["angle_id","master_id"];
const mode = modetype[1];
var CHANNEL_ACCESS_TOKEN = ((mode=='angle_id')?AngleToken:MasterToken); //for reply
var domain="https://angleline"+((mode=="angle_id")?"":"-master")+".herokuapp.com";
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.post('/' , chatParser); // POST 方法**/
/**app.post('/angle',anglebot);
app.post('/master',masterbot);
app.post('/hall',hallbot);
app.get('/monitor',monitorhtml);
app.get('/mailflush',mailflush);
app.post('/id',monitormail); //give line push
app.get('/give_id',giving_id_bot); //if call this bot will push line_id
**/
/**const message = {
  type: 'text',
  text: 'Hello World!'
};

client.replyMessage('<replyToken>', message)
  .then(() => {
    ...
  })
  .catch((err) => {
    // error handling
  });**/

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

function pushToSuv(recpt){
  psql("SELECT * FROM SUPERVISOR;").then(

    (groups) =>{

      for(group of groups){

        recpt.forEach(element => {
          console.log("pushmessage:"+element);
        });
    
        var options = {
            url: "https://api.line.me/v2/bot/message/push",
            method: 'POST',
            headers: {
              'Content-Type':  'application/json', 
              'Authorization':'Bearer ' + InfoToken
            },
            json: {
                "to": group.group_id.replace(/\s+/g, ""),
                'messages': recpt
            }
          };
        console.log(options);
        request(options, function (error, response, body) {
            if (error) throw error;
            console.log("(line)");
            console.log(body);
        });

      }      
    }
  );
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
        'Authorization':'Bearer ' + ((mode=='angle_id')?MasterToken:AngleToken)
      },
      json: {
          "to": id.replace(/\s+/g, ""),
          'messages': recpt
      }
    };
    console.log(options);
    request(options, function (error, response, body) {
        if (error) throw error;
        console.log("(line)");
        console.log(body);
    });

}

function imgpusher(recpt,id,img,msgid){
  var options = {
    url: "https://api.line.me/v2/bot/message/push",
    method: 'POST',
    headers: {
    'Content-Type':  'application/json', 
    'Authorization':'Bearer ' + ((mode=='angle_id')?MasterToken:AngleToken) 
    },
    json: {
        'to': id.replace(/\s+/g, ""),
        'messages': [recpt]
    }
  };
  var adrr ="/"+msgid+".jpg";
  options.json.messages[0].originalContentUrl=(domain+adrr);
  options.json.messages[0].previewImageUrl=(domain+adrr);
       
  app.get(adrr,(req,res)=>{
      //res.sendFile(__dirname+"/img.jpg");    
      res.writeHead(200, {'Content-Type': 'image/jpeg' });
      res.end(img, 'binary');
  });        
  
  request(options, function (error, response, body) {
      if (error) throw error;
      console.log("(line)");
      console.log(body);
  });
}

//------------build TCP/IP-------------
function chatParser(req ,res){
  //route
  var nwimg;
      
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
      var line_id = post.events[0].source.userId;
      
      /**var userMessage = post.events[0].message.text;
      console.log(replyToken);
      console.log(userMessage);**/
      if (typeof replyToken === 'undefined') {
          return;
      }      
            
      if (posttype == 'message'){        

          let gate = false;
          if(post.events[0].message.type == 'video' || post.events[0].message.type=='audio'){
            let text={
                "type":"text",
                "text":"抱歉，尚未支援影片及音訊傳輸~~"
            }
            replymessage([text]);
            gate=true;
          }          
          if(post.events[0].message.type == 'location'){
            
            let msg = post.events[0].message; 

            psql("SELECT * FROM ACCOUNT WHERE angle_id=\'" + line_id +"\';").then(
                (res)=>{
                    let text ={
                        "type":"text",
                        "text":""
                    }
                    if(res.length==1){
                        loc = game_item.gamelocation[res[0].location_problem];
                        console.log(loc);

                        if(Math.abs((msg.latitude - loc[0]))<0.0001 || Math.abs((msg.longitude - loc[1]))<0.0001){

                            text.text = "!!!!抵達目標，恭喜答對!!!!"
                            let msg =[]
                            if(res[0].location_count < (game_item.locationproblem.length - 1) ){
                                psql("UPDATE ACCOUNT SET score="+ String(res[0].score+10) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                psql("UPDATE ACCOUNT SET location_count="+ String(res[0].location_count +1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");

                                psql("UPDATE ACCOUNT SET location_problem="+ String((res[0].location_problem+1)%game_item.locationproblem.length) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                msg = [
                                    {
                                        "type":"text",
                                        "text":"恭喜破關!現在你的分數為"+String(res[0].score+10)
                                    },
                                    {
                                        "type":"text",
                                        "text":"[地點遊戲]下一關的題目："+game_item.locationproblem[(res[0].location_problem+1)%game_item.locationproblem.length]
                                    }
                                ];

                            }else{
                                msg = [
                                    {
                                        "type":"text",
                                        "text":"恭喜破關!現在你的分數為"+String(res[0].score+10)
                                    },
                                    {
                                        "type":"text",
                                        "text":"[地點遊戲]已經全部通關完畢，在此致上製作團隊八十七分的敬意"
                                    }
                                ];
                            }
                            
                            replymessage([text,msg[0],msg[1]]);
                            pushmessage([text,msg[0],msg[1]],res[0].master_id)
                           
                        }else if(Math.abs((msg.latitude - loc[0]))<0.0002 || Math.abs((msg.longitude - loc[1]))<0.0002){
                            text.text = "!!距離目標還有約20公尺!!"
                            replymessage([text]);
                        }else if(Math.abs((msg.latitude - loc[0]))<0.0003 || Math.abs((msg.longitude - loc[1]))<0.0003){
                            text.text = "!距離目標還有約30公尺!"
                            replymessage([text]);
                        }else if(Math.abs((msg.latitude - loc[0]))<0.0005 || Math.abs((msg.longitude - loc[1]))<0.0005){
                            text.text = "\\距離目標還有約50公尺/"
                            replymessage([text]);
                        }else if(Math.abs((msg.latitude - loc[0]))<0.001 || Math.abs((msg.longitude - loc[1]))<0.001){
                            text.text = "距離目標還有約100公尺"
                            replymessage([text]);
                        }else{
                            text.text = "距離目標太遠(約100公尺以上)"
                            replymessage([text]);
                        }
                    }else{
                        //debug code
                    }
                }
            );                    
        }else if(gate == false){

              psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+line_id+"\';").then(
                (writers)=>{
                  if(writers.length==1){                    
                    let msg = post.events[0].message;                                    
                    let type = msg.type;
                    let msgid = msg.id;                                
                    let receiver_id;
                    let bubble ={
                      "type": "bubble",
                      "header": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [{
                          "type": "text",
                          "text": "HunDow傳訊~~~~"
                        }]
                      },
                      "hero": {
                        "type": "image",
                        "url": writers[0].head_url.replace(/\s+/g, ""),
                      },
                      "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                          {
                            "type": "text",
                            "text": "來自 "+writers[0].angle_nickname.replace(/\s+/g, "")+" :"
                          }
                        ]
                      },
                  };
  
                  let head_msg ={  
                      "type": "flex",
                      "altText": "大講堂有消息，請借台手機開啟",
                      "contents":bubble 
                  };
                    
                    if(mode =='master_id'){
                      receiver_id = writers[0].master_id;

                      if(type == 'image'){
                        //set adrr
                        //adrr+=String(msgid);
                        //adrr+=".jpg";
                        //console.log(adrr);
                        // Configure the request
                        let getimage=new Promise((resolve,reject)=>{
                        let options = {
                            url: 'https://api.line.me/v2/bot/message/'+ msgid +'/content',
                            method: 'GET',
                            headers: {                
                            'Authorization':'Bearer ' + ((mode=='angle_id')?AngleToken:MasterToken)                   
                            },
                            encoding: null
                        }
            
                        // Start the request
  
                        request(options, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                            nwimg = body;
                            console.log(body);
                            resolve(body);                  
                            }else{
                            //console.log();
                            reject("!!!!!error when recpt image!!!!!");                
                            }
                        });              
                        });
                        
                        getimage
                        .then((body)=>{pushmessage([head_msg],receiver_id);imgpusher(msg,receiver_id,body,msgid);})
                        .catch((err)=>{
                        console.log("(linebotpromise)"+err);
                        }
                        );
  
                      }else{
                          pushmessage([head_msg,msg],receiver_id);                          
                      } 
                    }
                    else{
                      psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+writers[0].angle_id+"\';").then(
                        (res)=>{
                          receiver_id = res[0].angle_id;
                          if(type == 'image'){
                            //set adrr
                            //adrr+=String(msgid);
                            //adrr+=".jpg";
                            //console.log(adrr);
                            // Configure the request
                            let getimage=new Promise((resolve,reject)=>{
                            let options = {
                                url: 'https://api.line.me/v2/bot/message/'+ msgid +'/content',
                                method: 'GET',
                                headers: {                
                                'Authorization':'Bearer ' + ((mode=='angle_id')?AngleToken:MasterToken)                   
                                },
                                encoding: null
                            }
                
                            // Start the request
      
                            request(options, function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                nwimg = body;
                                console.log(body);
                                resolve(body);                  
                                }else{
                                //console.log();
                                reject("!!!!!error when recpt image!!!!!");                
                                }
                            });              
                            });
                            
                            getimage
                            .then((body)=>{pushmessage([head_msg],receiver_id);imgpusher(msg,receiver_id,body,msgid);})
                            .catch((err)=>{
                            console.log("(linebotpromise)"+err);
                            }
                            );
      
                          }else{
                              pushmessage([head_msg,msg],receiver_id);
                          } 
                        }
                      )
                    }
                    
                                       

                  }else{ //bug detecter
                    let text ={
                      "type":"text",
                      "text":""
                    }
                    text.text ="======HunDow 迷路了======\n發生程式錯誤，請到詢問站確認工程師已經在處理";
                    let text2 ={
                      "type":"text",
                      "text":""
                    }
                    text2.text ="如果詢問台沒有新訊息，請將以下訊息手動傳到詢問站";
                    let text3 ={
                      "type":"text",
                      "text":""
                    }
                    text3.text ="@promblem=多重帳號錯誤&from_id="+line_id+"&to_id="+receiver_id+"&code=postman.js:247";
                    replymessage([text,text2,text3]);
                    
                    pushToSuv([text3]);                    
                  }
                }
              );
          }
       
      }

      function replymessage(recpt){ //recpt is message object //for bug detecter
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
//!!!240




