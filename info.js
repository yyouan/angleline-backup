var express = require('express');
var request = require('request');
const querystring = require('querystring');
const game_item = require('./game_item.js');
const gameproblem = game_item.gameproblem;
const gamelocation = game_item.gamelocation;
const gameanswer = game_item.gameanswer;
const [AngleToken,MasterToken,HallToken,InfoToken] = [
    'JeHZW0fzS1rQX9yHvGRz0ZZqC+ENFDhsf/30grCHGk80MBiNjqDz76oj+ETgTnAXPjFCp/P/1EzYYbq4Ptz6U8tLCUxBHBlLeH4iozbORQOq1zYSc2cKosq8esu3/ttrZdeRRo0wsBoWI4gjTeEjuQdB04t89/1O/w1cDnyilFU=', 
    'BOpCS2JXlx/6DfqGmLVD9vU8FmjviF0TV/QJoLfkN0C465BHYiKtyfzP1Ov4wEIcF7xFvwu64T/RrO64+cai0dY7Th5yno/goN9+dJVa4EsLoNC5JV4mYF7ROws6Og6vfHByaSO/qQRZR8sy5Bz/twdB04t89/1O/w1cDnyilFU=',  
    'chRfdlc9nHQJyi8BLGXxExjrfNoGBMfH8DPqevbDaPYsgvP1WsZ8Aqi17HRS4dpfjtSLU5QD3G6b/RjZ4GflCh4N/hIhqWhBPPUJ56dhzxAfqRtgSPYadNTsTbcV/Hm1l4YUiJHYoDqaWO2o2qY/yAdB04t89/1O/w1cDnyilFU=',
    'bE7q3TnTG/MO9rE+0sME3betLgGFgqUpYCOv0OrmW/Uefjldl9a5am6xNyC0VRcnL87qKx1GMoPzGLKQDX/PRiERLTdZ2uIf5txK+1+JhIFsSIGwI00lGGaGavvCzkyKfy5A6QrqWZdfeu0J08SJDAdB04t89/1O/w1cDnyilFU='
  ]
var CHANNEL_ACCESS_TOKEN = InfoToken;
var channel_array ={};
const domain="https://informationdesk.herokuapp.com";

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
    console.log("to_id"+id);
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
function pushtoHall(recpt,id){
    recpt.forEach(element => {
        console.log("pushmessage:"+element);
    });
    console.log("to_id"+id);
    var options = {
        url: "https://api.line.me/v2/bot/message/push",
        method: 'POST',
        headers: {
          'Content-Type':  'application/json', 
          'Authorization':'Bearer ' + HallToken
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
function imgpusherS(recpt,img,msgid){

    let adrr ="/"+msgid+".jpg";
    recpt.originalContentUrl=(domain+adrr);
    recpt.previewImageUrl=(domain+adrr);

    psql("SELECT * FROM SUPERVISOR;").then(
  
        (groups) =>{
    
          for(group of groups){
            var options = {
                url: "https://api.line.me/v2/bot/message/push",
                method: 'POST',
                headers: {
                'Content-Type':  'application/json', 
                'Authorization':'Bearer ' + InfoToken
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

    );

    return recpt;

}

function imgpusher(recpt,id,img,msgid){

    let adrr ="/"+msgid+".jpg";
    var options = {
      url: "https://api.line.me/v2/bot/message/push",
      method: 'POST',
      headers: {
      'Content-Type':  'application/json', 
      'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN
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

        if(type == 'location'){
            psql("SELECT * FROM ACCOUNT WHERE angle_id=\'" + line_id +"\';").then(
                (res)=>{
                    let text ={
                        "type":"text",
                        "text":""
                    }
                    if(res.length==1){
                        loc = gamelocation[res[0].location_problem];
                        console.log(loc);

                        if(Math.abs((msg.latitude - loc[0]))<0.0001 || Math.abs((msg.longitude - loc[1]))<0.0001){

                            text.text = "!!!!抵達目標，恭喜答對!!!!"                           

                            psql("UPDATE ACCOUNT SET score="+ String(res[0].score+10) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                            let msg =[]
                            if(res[0].location_count < game_item.locationproblem.length){

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
        }
        else if(post.events[0].source.userId in channel_array){

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
                  let getimage=new Promise((resolve,reject)=>{
                  let options = {
                      url: 'https://api.line.me/v2/bot/message/'+ msgid +'/content',
                      method: 'GET',
                      headers: {                
                      'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN                  
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
                        let nick = res[0].angle_nickname.replace(/\s+/g, "");

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
                                'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN                  
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
                    let text ={
                        "type":"text",
                        "text":"##開始回覆"+res[0].angle_nickname.replace(/\s+/g, "")+"："
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
            if("nick" in data){
                console.log("nick_send");
                let msg_stored = JSON.parse(data.msg);
                let nickname = data.nick;
                let hate_intro ={
                    "type":"text",
                    "text":"$$有卦看黑特$$\n__*__－－－__*__"
                }
                let nick={
                    "type":"text",
                    "text":"from "+nickname+" :"
                }

                psql("SELECT * FROM ACCOUNT;").then(
                    (members)=>{
                        for(let member of members){
                            pushtoHall([hate_intro,nick,msg_stored],member.angle_id);
                            console.log(msg_stored);
                            console.log(member.angle_id);
                        }
                    }
                )
            }else{
                console.log("send");
                let msg_stored = JSON.parse(data.msg);
                let hate_intro ={
                    "type":"text",
                    "text":"$$有卦看黑特$$\n__*__－－－__*__"
                }

                psql("SELECT * FROM ACCOUNT;").then(
                    (members)=>{
                        for(let member of members){
                            pushtoHall([hate_intro,msg_stored],member.angle_id);
                            console.log(msg_stored);
                            console.log(member.angle_id);
                        }
                    }
                )
            };
            

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




