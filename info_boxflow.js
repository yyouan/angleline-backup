var express = require('express');
var request = require('request');
const querystring = require('querystring');
const game_item = require('./game_item.js');
const token = require('./token.js');
const gameproblem = game_item.gameproblem;
const gamelocation = game_item.gamelocation;
const gameanswer = game_item.gameanswer;
const [AngleTokens,MasterTokens,HallTokens,InfoTokens] = [
    [token.AngleToken,token.AngleToken_2],
    [token.MasterToken,token.MasterToken_2],
    [token.HallToken,token.HallToken_2],
    [token.InfoToken,token.InfoToken_2]
]
var CHANNEL_ACCESS_TOKEN = InfoTokens;
var channel_array ={};
const domain="https://informationdesk.herokuapp.com";

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});
const pool_2 = new Pool({
    connectionString: process.env.HEROKU_POSTGRESQL_ONYX_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.post('/' , chatParser); // POST 方法**/

/*
可以使用 $delete_message清空所有訊息
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
function psql_2(command){
   
    return new Promise((resolve,reject)=>{
        //while(is_conn_psql){console.log("(psql):pararell gate");};
        //if(!is_conn_psql){client.connect();is_conn_psql = true;}
        let recpt =[];
        let error;
        console.log("(psql_2):" + command );
        pool_2.connect()
        .then(client=>{            
            client.query(command)
            .then(res => {
                client.release();
                for (let row of res.rows) {                
                    recpt.push(row);
                    console.log( "(psql_2-query):"+ JSON.stringify(row));
                }
                resolve(recpt);
                for(let row of recpt){
                    console.log( "(psql_2-query-recpt):"+ JSON.stringify(row));
                }
                console.log( "(psql_2-query-recpt):"+ recpt.length);    
            })
            .catch(e => {client.release(); console.error("(psql_2):" + e.stack);reject(e);});            
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
    console.log("to_id"+id);
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
function pushtoHall(recpt,id){
    recpt.forEach(element => {
        console.log("pushmessage:"+element);
    });
    console.log("to_id"+id);

    for(let token of HallTokens){

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
      console.log(post);
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
            "altText": "管理員有消息，請借台手機開啟",
            "template": {
                "type": "buttons",                            
                "text": "請按結束結束回覆",                            
                "actions": [
                    {
                    "type": "postback",
                    "label": "結束",
                    "data": "finish=1"
                    }
                ]
            }
        };                
        let finish_name_button =
        {
            "type": "template",
            "altText": "管理員有消息，請借台手機開啟",
            "template": {
                "type": "buttons",                            
                "text": "請按結束停止輸入姓名",                            
                "actions": [
                    {
                    "type": "postback",
                    "label": "結束",
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

      if (posttype == 'join' && post.events[0].source.type =="group"){ 
        
        console.log('join');
        psql("INSERT INTO SUPERVISOR (group_id) VALUES (\'"+ line_id +"\');");

        let text ={
            "type":"text",
            "text":"完成管理員群組登錄"
        }
        replymessage([text]);            
    }
            
    if (posttype == 'message'){

        let msg = post.events[0].message;                                    
        let type = msg.type;
        let msgid = msg.id;

        if(type == 'sticker' && msg.stickerId == '4' && msg.packageId == '1'){
            psql("SELECT * FROM MESSAGE;").then(
                msgs=>{
                    
                    push(0);

                    function push(index){
                        if(index<msgs.length){
                            mes = JSON.parse(msgs[index].content.replace(/\s+/g, ""));
                            pushmessage(mes,line_id);
                            index++;
                            setTimeout(()=>{push(index);},100);
                        }else{
                            console.log("finish message push!")                            
                        }
                    }
                    
                }
            )
        }
        
        if(post.events[0].source.userId in channel_array){

                let msg = post.events[0].message;                                    
                let type = msg.type;
                let msgid = msg.id;                                
                let receiver_id = channel_array[post.events[0].source.userId];

                if(type == 'image'){
                  //set adrr
                  //+=String(msgid);
                  //adrr+=".jpg";
                  //console.log(adrr);
                  // Configure the request
                  for(let token of CHANNEL_ACCESS_TOKEN){

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
                        .then((body)=>{imgpusher(msg,receiver_id,body,msgid);})
                        .catch((err)=>{
                        console.log("(linebotpromise)"+err);
                        }
                        );

                  }
                  

                }else{                    
                    if(receiver_id == "@加卷"){
                        psql("SELECT * FROM ACCOUNT WHERE name=\'"+msg.text+"\';").then(
                            res =>{
                                if(res.length == 0){
                                    let text ={
                                        "type":"text",
                                        "text":"沒有這個人，請重新輸入"
                                    }
                                    replymessage([finish_name_button,text]);
                                }else if(res.length == 1){
                                    psql("UPDATE ACCOUNT SET ticket="+ (res[0].ticket+3) +" WHERE name=\'"+msg.text+"\';");
                                    let text ={
                                        "type":"text",
                                        "text":"完成加卷"
                                    }                                   
                                    replymessage([finish_name_button,text]);
                                }else{
                                    let text ={
                                        "type":"text",
                                        "text":"有兩個人以上同名同姓，請改輸入email"
                                    }
                                    channel_array[post.events[0].source.userId] ="@email";
                                    replymessage([finish_name_button,text]);
                                }
                            }
                        )
                    }else if(receiver_id == "@email"){
                        psql("SELECT * FROM ACCOUNT WHERE name=\'"+msg.text+"\';").then(
                            res =>{
                                if(res.length == 0){
                                    let text ={
                                        "type":"text",
                                        "text":"沒有郵件，請重新輸入"
                                    }
                                    replymessage([finish_name_button,text]);
                                }else if(res.length ==1){
                                    psql("UPDATE ACCOUNT SET ticket="+ (res[0].ticket+3) +" WHERE email=\'"+msg.text+"\';");
                                    let text ={
                                        "type":"text",
                                        "text":"完成加卷"
                                    }                                   
                                    replymessage([finish_name_button,text]);
                                }else{
                                    let text ={
                                        "type":"text",
                                        "text":"系統同email錯誤"
                                    }
                                    replymessage([finish_name_button,text]);
                                }
                            }
                        )
                    }
                    else{                        
                        pushmessage([msg],receiver_id);
                        let text ={
                            "type":"text",
                            "text":"繼續回覆："
                        }
                        replymessage([finish_button,text]);
                    }                    
                } 

        }else{
            let reply_id = line_id;
            let msg = post.events[0].message;                                    
            let type = msg.type;
            let msgid = msg.id;

                if(post.events[0].message.type == 'text'){

                    var email = post.events[0].message.text;                    
                    
                    if(email.substr(0,1)=="@"){
                        console.log(email);
                        let rawdata = email.substr(1);
                        let data = querystring.parse(rawdata);
                        reply_id = data.from_id;

                    }
                    if(email =="$delete_message"){
                        psql("DELETE FROM MESSAGE;")
                    }                    
                    
                }

                let text ={
                    "type":"text",
                    "text":"收到了，待會會回覆您"
                }
                let reply_button =
                {
                    "type": "template",
                    "altText": "管理員有消息，請借台手機開啟",
                    "template": {
                        "type": "buttons",                            
                        "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                        "actions": [
                            {
                            "type": "postback",
                            "label": "回覆",
                            "data": "reply_id="+reply_id +"&msgid="+msgid
                            }
                        ]
                    }
                };
    
                if(post.events[0].source.type != "group"){
                    replymessage([text]);
                }

            if(post.events[0].source.type != "group"){

                psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+line_id+"\';").then(
                    res =>{

                        let nick;

                        if(res.length==0){

                            nick=''

                        }else{

                            nick = res[0].angle_nickname.replace(/\s+/g, "");

                        }                         

                        if(type == 'image'){
                            //set adrr
                            //adrr+=String(msgid);
                            //adrr+=".jpg";
                            //console.log(adrr);
                            // Configure the request
                            for(let token of CHANNEL_ACCESS_TOKEN){

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
                                            "text" : "##來自小隊員"+nick+"："
                                        }                                
                                        pushToSuv([text]);
                                        let imagemsg=imgpusherS(msg,body,msgid);
                                        pushToSuv([reply_button]);
                                        psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text,imagemsg,reply_button])+"\',\'"+msgid+"\');");                                         
                                    })
                                    .catch((err)=>{
                                    console.log("(linebotpromise)"+err);
                                    }
                                    );

                            }
                            
            
                          }else{
                            let text ={
                                "type" : "text",
                                "text" : "##來自小隊員 "+nick+"："
                            }
                            pushToSuv([text,msg,reply_button]);
                            psql("INSERT INTO MESSAGE (content,msgid) VALUES (\'"+JSON.stringify([text,msg,reply_button])+"\',\'"+msgid+"\');");                    
                          }
                    }
                );
                
            }
                
            }
          
            

            
      }        

    if (posttype == 'postback'){

        // record userId,reply_id pair
        let rawdata = post.events[0].postback.data;
        let data = querystring.parse(rawdata);

        if("reply_id" in data) {
            
            channel_array[post.events[0].source.userId] = data.reply_id;
            psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+data.reply_id+"\';").then(
                res =>{
                    let text;
                    if(res.length == 0){

                        text ={
                            "type":"text",
                            "text":"##開始回覆"+"："
                        }
                        
                    }else{
                        
                        text ={
                            "type":"text",
                            "text":"##開始回覆"+res[0].angle_nickname.replace(/\s+/g, "")+"："
                        }                        
                    }
                                
                    replymessage([finish_button,text]);
                }
            );
            psql("SELECT * FROM MESSAGE WHERE msgid=\'"+data.msgid+"\';").then(
                res =>{
                    let text1={
                        "type":"text",
                        "text":"##管理員回覆此則訊息："
                    }
                    let text2={
                        "type":"text",
                        "text":"##回覆如下："
                    }
                    let content =JSON.parse(res[0].content)
                    let replied = (content.length == 3)?(content[1]):(content[2])                    
                    pushmessage([text1,replied,text2] ,data.reply_id)
                }
            )
            psql("DELETE FROM MESSAGE WHERE msgid=\'"+data.msgid+"\';")            

        }else if("finish" in data){

            if( post.events[0].source.userId in channel_array){
                delete channel_array[post.events[0].source.userId];
            }
            let text ={
                "type":"text",
                "text":"##結束回覆"
            }            
            replymessage([text]);

        }else if("send" in data){
            psql_2("SELECT * FROM BOX WHERE box_id=\'"+data.boxid+"\';").then(
                recpt =>{
                    if(recpt.length == 0){
                        psql_2("CREATE TABLE "+data.box_id+"_cash(cash_id char(50));");                        
                    }
                }
            )            
            psql_2("INSERT INTO BOX (box_id,connect_line_id,balance,cash_array,menu_array) VALUES (\'"
            +data.boxid+"\',\'"+data.line_id+"\',0,\'\',\'\');");
            
        }else if("complete" in data){
            console.log("complete");
            psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+data.complete+"\';").then(
                res =>{
                    psql("UPDATE ACCOUNT SET ticket="+ (res[0].ticket-1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                }
            )          
            channel_array[post.events[0].source.userId] ="@加卷" ;
            let text ={
                "type":"text",
                "text":"輸入完成要求者姓名："
            }            
            replymessage([finish_button,text]);
            psql("DELETE FROM MESSAGE WHERE msgid=\'"+data.msgid+"\';")
        }
                 
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



