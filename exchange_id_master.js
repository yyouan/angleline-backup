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
const modetype =["angle_id","master_id"];
const mode = modetype[1];
var CHANNEL_ACCESS_TOKEN = ((mode=='angle_id')?MasterTokens:AngleTokens);

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
  function pushToSuv(recpt){
    psql("SELECT * FROM SUPERVISOR;").then(
  
      (groups) =>{
  
        for(group of groups){
  
          recpt.forEach(element => {
            console.log("pushmessage:"+element);
          });
          for(let token of InfoTokens){

            var options = {
                url: "https://api.line.me/v2/bot/message/push",
                method: 'POST',
                headers: {
                  'Content-Type':  'application/json', 
                  'Authorization':'Bearer ' + token
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
      }
    );
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
   
  
  }

  function imgpusher(recpt,id,img,msgid){

    var domain="https://angleline"+((mode=="angle_id")?"":"-master")+".herokuapp.com";

    for(let token of ((mode=='angle_id')?MasterTokens:AngleTokens) ){

        var options = {
            url: "https://api.line.me/v2/bot/message/push",
            method: 'POST',
            headers: {
            'Content-Type':  'application/json', 
            'Authorization':'Bearer ' + token 
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
    
  }

  //------------main code------------------
  psql("SELECT * FROM ACCOUNT;").then(
      (members)=>{
        for(let member of members){
            let give_button =
            {
                "type": "template",
                "altText": "HunDow有消息，請借台手機開啟",
                "template": {
                    "type": "buttons",                            
                    "text": "謝謝您參加本次小天使與小主人，如果希望提供聯絡資訊給對方，可以按\"給\"~~",                            
                    "actions": [
                        {
                        "type": "postback",
                        "label": "給!",
                        "data": "give=1&phone="+member.phone+"&master_id="+member.master_id
                        }
                    ]
                }
            };
            psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+member.angle_id+"\';").then(
                res =>{
                    let text ={
                        "type":"text",
                        "text":"你的小主人是第 "+res[0].groupindex+" 組的 "+res[0].name.replace(/\s+/g, "")
                    }
                    pushmessage([give_button,text],member.angle_id);
                }
            );
            
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
            
            for(let token of ((mode=='angle_id')?AngleTokens:MasterTokens) ){

                let options = {
                    url: 'https://api.line.me/v2/bot/profile/'+ line_id,
                    method: 'GET',
                    headers: {                
                    'Authorization':'Bearer ' + token                  
                    }               
                }
            
                // Start the request
            
                request(options, function (error, response, rawbody) {
                    if (!error && response.statusCode == 200) {
                        var body = JSON.parse(rawbody);
                        console.log(body);
                        console.log(body.pictureUrl);
                        let bubble_to_master ={
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
                        };
        
                        let msg_to_master ={  
                            "type": "flex",
                            "altText": "HunDow有消息，請借台手機開啟",
                            "contents":bubble_to_master 
                        };
                        
                        let bubble_to_angle ={
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
                        };
        
                        let msg_to_angle ={  
                            "type": "flex",
                            "altText": "HunDow有消息，請借台手機開啟",
                            "contents":bubble_to_angle 
                        };
    
                        let text ={
                            "type":"text",
                            "text":"已經傳送!"
                        }
                        
                        if(mode == 'master_id'){
    
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
        if(gate == false){

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
                      for(let token of ((mode=='angle_id')?AngleTokens:MasterTokens)){

                        let getimage=new Promise((resolve,reject)=>{
                        
                            let options = {
                                url: 'https://api.line.me/v2/bot/message/'+ msgid +'/content',
                                method: 'GET',
                                headers: {                
                                'Authorization':'Bearer ' + token                  
                                },
                                encoding: null
                            }
                
                            // Start the request
      
                            request(options, function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                //nwimg = body;
                                console.log(body);
                                resolve(body);                  
                                }else{
                                console.log(error);
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

                      }
                      

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
                              'Authorization':'Bearer ' + ((mode=='angle_id')?AngleTokens:MasterTokens)                   
                              },
                              encoding: null
                          }
              
                          // Start the request
    
                          request(options, function (error, response, body) {
                              if (!error && response.statusCode == 200) {
                              //nwimg = body;
                              console.log(body);
                              resolve(body);                  
                              }else{
                              console.log(error);
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
        function replymessage(recpt){ //recpt is message object
         for(let token of ((mode=='angle_id')?AngleTokens:MasterTokens) ){

            var options = {
                url: "https://api.line.me/v2/bot/message/reply ",
                method: 'POST',
                headers: {
                  'Content-Type':  'application/json', 
                  'Authorization':'Bearer ' + token
                },
                json: {
                    'replyToken': post.events[0].replyToken,
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
//!!!240