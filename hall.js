var express = require('express');
var request = require('request');
const querystring = require('querystring');
var cookieParser = require('cookie-parser');
const game_item = require('./game_item.js');
var url = require('url');
const token = require('./token.js');
const [AngleTokens,MasterTokens,HallTokens,InfoTokens] = [
    [token.AngleToken,token.AngleToken_2],
    [token.MasterToken,token.MasterToken_2],
    [token.HallToken,token.HallToken_2],
    [token.InfoToken,token.InfoToken_2]
]
var CHANNEL_ACCESS_TOKEN = HallTokens;
var channel_array ={};
const domain="https://angleline-hall.herokuapp.com";

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.use(cookieParser());
app.post('/' , chatParser); // POST 方法**/
app.get('/game',GameProceessor);

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
function pushtoMaster(recpt,id){

    recpt.forEach(element => {
        console.log("pushmessage:"+element);
    });

    for(let token of MasterTokens){

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

function pushtoAngle(recpt,id){
    recpt.forEach(element => {
        console.log("pushmessage:"+element);
    });
    for(let token of AngleTokens){

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
function imgpusherS(recpt,img,msgid){

    let adrr ="/"+msgid+".jpg";
    recpt.originalContentUrl=(domain+adrr);
    recpt.previewImageUrl=(domain+adrr);

    psql("SELECT * FROM SUPERVISOR;").then(
  
        (groups) =>{
    
          for(group of groups){

            for(let token of InfoTokens){
                var options = {
                    url: "https://api.line.me/v2/bot/message/push",
                    method: 'POST',
                    headers: {
                    'Content-Type':  'application/json', 
                    'Authorization':'Bearer ' + token
                    },
                    json: {
                        'to':group.group_id.replace(/\s+/g, ""),
                        'messages': [recpt]
                    }
                  };             
                  
                       
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
          
        }

    );

    return recpt;

}

function imgpusher(recpt,id,img,msgid){
    let adrr ="/"+msgid+".jpg";

    for(let token of CHANNEL_ACCESS_TOKEN){

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
    return recpt;
  }
//------------build TCP/IP-------------
function chatParser(req ,res){
  //route
  //var nwimg;
    
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
      if( post.events[0].source.type == 'group'){
          line_id = post.events[0].source.groupId;
      }      
      
      let finish_button =
        {
            "type": "template",
            "altText": "大講堂有消息，請借台手機開啟",
            "template": {
                "type": "buttons",                            
                "text": "如果要結束回覆請按按鈕，如果不要，請繼續輸入",                            
                "actions": [
                    {
                    "type": "postback",
                    "label": "結束回覆",
                    "data": "finish=1"
                    }
                ]
            }
        };
        
      /**var userMessage = post.events[0].message.text;
      console.log(replyToken);
      console.log(userMessage);**/
      if (typeof replyToken === 'undefined') {
          return;
      }
    if(posttype == 'postback'){
        let rawdata = post.events[0].postback.data;
        let data = querystring.parse(rawdata);

        if("nick" in data) {
            if(data.nick==1){
                channel_array[post.events[0].source.userId]="暱稱發文";
                let text ={
                    "type":"text",
                    "text":"使用暱稱，請輸入黑特訊息："
                };
                replymessage([text]); 
            }else{
                let text ={
                    "type":"text",
                    "text":"不使用暱稱，請輸入黑特訊息："
                };
                replymessage([text]);
            }
        }
    }
    if (posttype == 'message'){
            let msg = post.events[0].message;                                    
            let type = msg.type;
            let msgid = msg.id;
            if(post.events[0].source.userId in channel_array){

                let msg = post.events[0].message;                                    
                let type = msg.type;
                let msgid = msg.id;                                
                let receiver_id = channel_array[post.events[0].source.userId];
                let gate = false;

                if(post.events[0].message.type == 'text'){

                    var email = post.events[0].message.text;                                      
                    
                    if(email=="@匿名發文"){
                        channel_array[post.events[0].source.userId]="匿名發文";
                        let reply_button =
                        {
                            "type": "template",
                            "altText": "大講堂有消息，請借台手機開啟",
                            "template": {
                                "type": "buttons",                            
                                "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                                "actions": [
                                    {
                                        "type": "postback",
                                        "label": "使用暱稱發文",
                                        "data": "nick=1"
                                    },
                                    {
                                        "type": "postback",
                                        "label": "完全匿名發文",
                                        "data": "nick=0"     
                                    }
                                ]
                            }
                        };
                        pushmessage([reply_button],line_id);
                        //hate();                                            
                    }else if(email=="@真心話"){
                        channel_array[post.events[0].source.userId]="真心話";
                        //inner_word(); 
                    }else if(email=="@大冒險"){
                        channel_array[post.events[0].source.userId]="大冒險";
                        //adventure();                         
                    }else{
                        gate =true;
                    }                    
                }else{
                    gate=true;
                }

                if(gate==true){
                    console.log(channel_array[post.events[0].source.userId]);
                    if(channel_array[post.events[0].source.userId]=="匿名發文"){
                        hate();
                    }else if(channel_array[post.events[0].source.userId]=="暱稱發文"){
                        nick_hate();
                    }else if(channel_array[post.events[0].source.userId]=="真心話"){
                        inner_word();
                    }else if(channel_array[post.events[0].source.userId]=="大冒險"){
                        adventure();
                    }
                }

            }else{

                if(post.events[0].message.type == 'text'){

                    var email = post.events[0].message.text;                                      
                    
                    if(email=="@匿名發文"){

                        channel_array[post.events[0].source.userId]="匿名發文";
                        let reply_button =
                        {
                            "type": "template",
                            "altText": "大講堂有消息，請借台手機開啟",
                            "template": {
                                "type": "buttons",                            
                                "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                                "actions": [
                                    {
                                        "type": "postback",
                                        "label": "使用暱稱發文",
                                        "data": "nick=1"
                                    },
                                    {
                                        "type": "postback",
                                        "label": "完全匿名發文",
                                        "data": "nick=0"     
                                    }
                                ]
                            }
                        };
                        pushmessage([reply_button],line_id);

                    }else if(email=="@真心話"){
                        channel_array[post.events[0].source.userId]="真心話";
                        //inner_word(); 
                    }else if(email=="@大冒險"){
                        channel_array[post.events[0].source.userId]="大冒險";
                        //adventure();                         
                    }
                    else{
                        let text ={
                            "type":"text",
                            "text":"尚未選擇模式，請按視窗下方按鈕，可以匿名黑特、真心話、大冒險"
                        };
                        replymessage([text]);                    
                    }
                }else{
                    let text ={
                        "type":"text",
                        "text":"尚未選擇模式，請按視窗下方按鈕，可以匿名黑特、真心話、大冒險"
                    };
                    replymessage([text]);
                }              
            }

            function hate(){

                let reply_button =
                {
                    "type": "template",
                    "altText": "大講堂有消息，請借台手機開啟",
                    "template": {
                        "type": "buttons",                            
                        "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                        "actions": [
                            {
                                "type": "postback",
                                "label": "寄出",
                                "data": "send=1"+"&msgid="+msgid
                            },
                            {
                                "type": "postback",
                                "label": "拒絕且回覆",
                                "data": "reply_id="+line_id +"&msgid="+msgid     
                            }
                        ]
                    }
                };
                if(post.events[0].message.type == 'video' || post.events[0].message.type=='audio'){
                    let text={
                        "type":"text",
                        "text":"抱歉，尚未支援影片及音訊傳輸~~"
                    }
                    replymessage([text]);
                }else{
                    let text ={
                        "type":"text",
                        "text":"黑特已交給管理員審核"
                    }
                    replymessage([text])
                }                

                if(type == 'image'){
                    //set adrr
                    //adrr+=String(msgid);
                    //adrr+=".jpg";
                    //console.log(adrr);
                    // Configure the request
                    for(token of CHANNEL_ACCESS_TOKEN){

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
                                //console.log();
                                reject("!!!!!error when recpt image!!!!!");                
                                }
                            });              
                            });
                            
                            getimage
                            .then((body)=>{
                                let text ={
                                    "type" : "text",
                                    "text" : "$黑特審核："
                                }
                                pushToSuv([text]);
                                var messagestored = imgpusherS(msg,body,msgid);
                                reply_button.template.actions[0].data +=("&msg="+JSON.stringify(messagestored));
                                pushToSuv([reply_button]);
                                psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text,messagestored,reply_button])+"\',\'"+msgid+"\');");                                               
                            })
                            .catch((err)=>{
                            console.log("(linebotpromise)"+err);
                            }
                            );

                    }
                    
    
                  }else{
                    let text ={
                        "type" : "text",
                        "text" : "$黑特審核："
                    }
                    reply_button.template.actions[0].data +=("&msg="+JSON.stringify(msg));

                    pushToSuv([text,msg,reply_button]);
                    psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text,msg,reply_button])+"\',\'"+msgid+"\');");                       
                  }
            };
            function nick_hate(){

                let reply_button =
                {
                    "type": "template",
                    "altText": "大講堂有消息，請借台手機開啟",
                    "template": {
                        "type": "buttons",                            
                        "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                        "actions": [
                            {
                                "type": "postback",
                                "label": "寄出",
                                "data": "send=1"+"&msgid="+msgid
                            },
                            {
                                "type": "postback",
                                "label": "拒絕且回覆",
                                "data": "reply_id="+line_id +"&msgid="+msgid     
                            }
                        ]
                    }
                };
                if(post.events[0].message.type == 'video' || post.events[0].message.type=='audio'){
                    let text={
                        "type":"text",
                        "text":"抱歉，尚未支援影片及音訊傳輸~~"
                    }
                    replymessage([text]);
                }else{
                    let text ={
                        "type":"text",
                        "text":"黑特已交給管理員審核"
                    }
                    replymessage([text])
                }                
                psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+line_id+"\';").then(
                    res =>{
                        let nick={
                            "type":"text",
                            "text":"from "+res[0].angle_nickname.replace(/\s+/g, "")+" :"
                        }
                        let nickname =res[0].angle_nickname.replace(/\s+/g, "");
                        if(type == 'image'){
                            //set adrr
                            //adrr+=String(msgid);
                            //adrr+=".jpg";
                            //console.log(adrr);
                            // Configure the request
                            for( let token of CHANNEL_ACCESS_TOKEN){

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
                                        //console.log();
                                        reject("!!!!!error when recpt image!!!!!");                
                                        }
                                    });              
                                });
                                    
                                    getimage
                                    .then((body)=>{
                                        let text ={
                                            "type" : "text",
                                            "text" : "$黑特審核："
                                        }
                                        pushToSuv([text,nick]);
                                        var messagestored = imgpusherS(msg,body,msgid);
                                        reply_button.template.actions[0].data +=("&msg="+JSON.stringify(messagestored)+"&nick="+nickname);
                                        pushToSuv([reply_button]);
                                        psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text,nick,messagestored,reply_button])+"\',\'"+msgid+"\');");                                               
                                    })
                                    .catch((err)=>{
                                    console.log("(linebotpromise)"+err);
                                    }
                                    );

                            }
                            
            
                          }else{
                            let text ={
                                "type" : "text",
                                "text" : "$黑特審核："
                            }
                            reply_button.template.actions[0].data +=("&msg="+JSON.stringify(msg)+"&nick="+nickname);
        
                            pushToSuv([text,nick,msg,reply_button]);
                            psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text,nick,msg,reply_button])+"\',\'"+msgid+"\');");                       
                          }
                    }
                )
                
            };
            function inner_word(){
                let reply_button =
                {
                    "type": "template",
                    "altText": "大講堂有消息，請借台手機開啟",
                    "template": {
                        "type": "buttons",                            
                        "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                        "actions": [                            
                            {
                                "type": "postback",
                                "label": "拒絕且回覆",
                                "data": "reply_id="+line_id+"&msgid="+msgid     
                            },{
                                "type": "postback",
                                "label": "唸完了",
                                "data": "said=1"+"&msgid="+msgid
                            }
                        ]
                    }
                };
                let text={
                    "type":"text",
                    "text":"已收到真心話"
                } ;
                if(type != 'text'){
                    text.text ="真心話只能傳文字訊息?!SORRY"
                }
                replymessage([text]);
                let text2={
                    "type":"text",
                    "text":"$真心話："
                };
                pushToSuv([text2,msg,reply_button]);
                psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text2,msg,reply_button])+"\',\'"+msgid+"\');");
            };
            function adventure(){
                if(type != 'text'){
                    let text={
                        "type":"text",
                        "text":""
                    };
                    text.text ="大冒險只能傳文字訊息?!SORRY";
                    replymessage([text]);
                }else{
                    psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+line_id+"\';").then(
                        (members)=>{
                            var ticket = members[0].ticket;
                            
                            if(ticket<=-2){
                                let text={
                                    "type":"text",
                                    "text":"命令卷不足(<=-2)"
                                } ;
                                replymessage([text]);
                            }
                            else{
                                let reply_button2 =
                                    {
                                        "type": "template",
                                        "altText": "大講堂有消息，請借台手機開啟",
                                        "template": {
                                            "type": "buttons",                            
                                            "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                                            "actions": [                            
                                                {
                                                    "type": "postback",
                                                    "label": "拒絕且回覆",
                                                    "data": "reply_id="+line_id+"&msgid="+msgid     
                                                }
                                            ]
                                        }
                                    };
                                let reply_button =
                                {
                                    "type": "template",
                                    "altText": "大講堂有消息，請借台手機開啟",
                                    "template": {
                                        "type": "buttons",                            
                                        "text": "如果這個大冒險被執行，請按底下的按鈕",                            
                                        "actions": [
                                            {
                                                "type": "postback",
                                                "label": "大冒險已完成",
                                                "data": "complete="+line_id +"&msgid="+msgid
                                            }
                                        ]
                                    }
                                };
                                let text={
                                    "type":"text",
                                    "text":"已收到大冒險"
                                } ;
                                replymessage([text]);
                                let text2={
                                    "type":"text",
                                    "text":"$大冒險："
                                };
                                pushToSuv([text2,msg,reply_button,reply_button2]);
                                psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text2,msg,reply_button])+"\',\'"+msgid+"\');");
                            }
                            
                        }
                    )
                }
                
            };
            

            
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
//!!!240

function GameProceessor(req,res){
    let q = url.parse(req.url,true);
    console.log(q.query); //?game_name=
    
    let game_name = q.query.name;
    let game_index =game_item.gameanswer.indexOf(game_name);    
        //req.cookie('isVisit', 1);
        let cookie = req.cookies;
        //console.log(req.headers);
        console.log(req.cookies);
        //console.log(req);
        psql("SELECT * FROM ACCOUNT WHERE email=\'"+cookie.email+"\';") //use angle_id to be the team's score
        .then(
            (req)=>{
                if(game_index!=-1){

                    if(req.length!=1){
                        
                        let text ={
                            "type":"text",
                            "text":"有人在新的瀏覽器使用cookie"
                        }
                        pushToSuv([text]);

                    }else{
                        //0.one of pair know the person will win the score 1                        
                        if(req[0].problem != game_index){

                            psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+req[0].angle_id+"\';").then(
                                (res)=>{

                                    if(res.length == 1){

                                        if(res[0].problem == game_index){                                        
                                            //go to next problem
                                            //send next problem to partner
                                            let msg=[]
    
                                            if(res[0].problem_count < (game_item.gameproblem.length-1) ){
    
                                                psql("UPDATE ACCOUNT SET score="+ String(res[0].score+20) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                                psql("UPDATE ACCOUNT SET problem_count="+ String(res[0].problem_count+1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
    
                                                psql("UPDATE ACCOUNT SET problem="+ String((res[0].problem+1)%game_item.gameproblem.length) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                                msg = [
                                                    {
                                                        "type":"text",
                                                        "text":"恭喜破關!現在小組分數為"+String(res[0].score+20)
                                                    },
                                                    {
                                                        "type":"text",
                                                        "text":"[QRcode遊戲]下一關的題目："+game_item.gameproblem[(res[0].problem+1)%game_item.gameproblem.length]
                                                    }
                                                ]
                                            }else{
                                                psql("UPDATE ACCOUNT SET score="+ String(res[0].score+20) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                                psql("UPDATE ACCOUNT SET problem_count="+ String(res[0].problem_count+1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");

                                                msg = [
                                                    {
                                                        "type":"text",
                                                        "text":"現在小組分數為"+String(res[0].score+20)
                                                    },
                                                    {
                                                        "type":"text",
                                                        "text":"[QRcode遊戲]全部的關卡都破完了，獻上製作委員會的特別感謝!!你們是最棒的小天使與小主人!!"
                                                    }
                                                ]
                                            }
                                            
                                            pushtoMaster(msg,res[0].angle_id);
                                            pushtoAngle(msg,res[0].master_id);
                                        }else{
                                            psql("UPDATE ACCOUNT SET score="+ String(res[0].score-1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                            psql("UPDATE ACCOUNT SET score="+ String(req[0].score-1) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                                            let msg_master = [
                                                {
                                                    "type":"text",
                                                    "text":"問錯人了!現在小組分數為"+String(res[0].score-1)
                                                },
                                                {
                                                    "type":"text",
                                                    "text":"提醒題目："+game_item.gameproblem[res[0].problem]
                                                }
                                            ]
                                            
                                            let msg_angle = [
                                                {
                                                    "type":"text",
                                                    "text":"問錯人了!現在小組分數為"+String(req[0].score-1)
                                                },
                                                {
                                                    "type":"text",
                                                    "text":"提醒題目："+game_item.gameproblem[req[0].problem]
                                                }
                                            ]
                                            pushtoMaster(msg_master,res[0].angle_id);
                                            pushtoAngle(msg_master,res[0].master_id);
                                            pushtoMaster(msg_angle,req[0].angle_id);
                                            pushtoAngle(msg_angle,req[0].master_id);
                                        }
                                    }
                                    
                                }
                            );
                        }else{
                            
                            let msg=[]
                            if(req[0].problem_count < (game_item.gameproblem.length-1) ){

                                psql("UPDATE ACCOUNT SET score="+ String(req[0].score+20) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                                psql("UPDATE ACCOUNT SET problem_count="+ String(req[0].problem_count+1) +" WHERE angle_id=\'" + req[0].angle_id +"\';");

                                psql("UPDATE ACCOUNT SET problem="+ String((req[0].problem+1)%game_item.gameproblem.length) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                                 msg = [
                                    {
                                        "type":"text",
                                        "text":"恭喜破關!現在小組分數為"+String(req[0].score+20)
                                    },
                                    {
                                        "type":"text",
                                        "text":"[QRcode遊戲]下一關的題目："+game_item.gameproblem[(req[0].problem+1)%game_item.gameproblem.length]
                                    }
                                ]

                            }else{
                                psql("UPDATE ACCOUNT SET score="+ String(req[0].score+20) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                                psql("UPDATE ACCOUNT SET problem_count="+ String(req[0].problem_count+1) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                                
                                msg = [
                                    {
                                        "type":"text",
                                        "text":"現在小組分數為"+String(req[0].score+20)
                                    },
                                    {
                                        "type":"text",
                                        "text":"[QRcode遊戲]全部的關卡都破完了，獻上製作委員會的特別感謝!!你們是最棒的小天使與小主人!!"
                                    }
                                ]
                            }
                            
                            pushtoMaster(msg,req[0].angle_id);
                            pushtoAngle(msg,req[0].master_id);
                            
                            //for two pair has same problem :
                            psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+req[0].angle_id+"\';").then(
                                (res)=>{

                                    if(res.length == 1){

                                        if(res[0].problem == game_index){                                        
                                            //go to next problem
                                            //send next problem to partner
                                            let msg=[]
    
                                            if(res[0].problem_count < (game_item.gameproblem.length-1) ){
    
                                                psql("UPDATE ACCOUNT SET score="+ String(res[0].score+20) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                                psql("UPDATE ACCOUNT SET problem_count="+ String(res[0].problem_count+1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
    
                                                psql("UPDATE ACCOUNT SET problem="+ String((res[0].problem+1)%game_item.gameproblem.length) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                                msg = [
                                                    {
                                                        "type":"text",
                                                        "text":"恭喜破關!現在小組分數為"+String(res[0].score+20)
                                                    },
                                                    {
                                                        "type":"text",
                                                        "text":"[QRcode遊戲]下一關的題目："+game_item.gameproblem[(res[0].problem+1)%game_item.gameproblem.length]
                                                    }
                                                ]
                                            }else{
                                                psql("UPDATE ACCOUNT SET score="+ String(res[0].score+20) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                                psql("UPDATE ACCOUNT SET problem_count="+ String(res[0].problem_count+1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");

                                                msg = [
                                                    {
                                                        "type":"text",
                                                        "text":"現在小組分數為"+String(res[0].score+20)
                                                    },
                                                    {
                                                        "type":"text",
                                                        "text":"[QRcode遊戲]全部的關卡都破完了，獻上製作委員會的特別感謝!!你們是最棒的小天使與小主人!!"
                                                    }
                                                ]
                                            }
                                            
                                            pushtoMaster(msg,res[0].angle_id);
                                            pushtoAngle(msg,res[0].master_id);
                                        }
                                    }
                                    
                                }
                            );
                        }                        
                        
                    }
                }else{ //4.wrong answer will let score descrese by 1
                    psql("UPDATE ACCOUNT SET score="+ String(req[0].score-1) +" WHERE email=\'"+cookie.email+"\';");
                    psql("UPDATE ACCOUNT SET score="+ String(req[0].score-1) +" WHERE angle_id=\'"+req[0].master_id+"\';");
                    let msg = [
                        {
                            "type":"text",
                            "text":"問錯人了!現在小組分數為"+String(req[0].score-1)
                        },
                        {
                            "type":"text",
                            "text":"提醒題目："+game_item.gameproblem[req[0].problem]
                        }
                    ]
                    pushtoMaster(msg,req[0].angle_id);
                    pushtoAngle(msg,req[0].master_id);
                }
        });
    res.sendFile(__dirname+'/game.html');
    
}


//會有other隨便亂數出來的ANSWER去扣點數

console.log("Game URL:");
for(let name of game_item.gameanswer){
    console.log("https://angleline-hall.herokuapp.com/game?name="+encodeURIComponent(name));
}



