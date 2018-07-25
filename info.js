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

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
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

function imgpusher(recpt,id,img){
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
  const domain="https://informationdesk.herokuapp.com";  
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
      if( post.events[0].source.type == 'group'){
          line_id = post.events[0].source.groupId;
      }      
                    
        let finish_button =
        {
            "type": "template",
            "altText": "找台手機開啟",
            "template": {
                "type": "buttons",                            
                "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                "actions": [
                    {
                    "type": "postback",
                    "label": "回覆",
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

      if (posttype == 'join' ){ //&& post.events[0].source.type =="group"
        
        console.log('join');
        psql("INSERT INTO SUPERVISOR (group_id) VALUES (\'"+ post.line_id +"\');");

        let text ={
            "type":"text",
            "text":"完成管理員群組登錄"
        }
        replymessage([req,text]);            
    }
            
    if (posttype == 'message'){

        let msg = post.events[0].message;                                    
        let type = msg.type;
        let msgid = msg.id;

        if(type == 'location'){
            psql("SELECT * FROM ACCOUNT WHERE line_id=\'" + line_id +"\';").then(
                (res)=>{
                    let text ={
                        "type":"text",
                        "text":""
                    }
                    if(res.length==1){
                        loc = gamelocation[res[0].problem];
                        if(Math.abs((msg.latitude - loc[0]))<0.0001 || Math.abs((msg.longitude - loc[1]))<0.0001){
                            text.text = "!!!!距離目標還有約10公尺!!!!"
                            replymessage([text]);
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
                  adrr+=String(msgid);
                  adrr+=".jpg";
                  console.log(adrr);
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
                  .then((body)=>{imgpusher(msg,receiver_id,body);})
                  .catch((err)=>{
                  console.log("(linebotpromise)"+err);
                  }
                  );

                }else{
                    pushmessage([msg],receiver_id);
                } 

        }else{
            let reply_id = line_id;

                if(post.events[0].message.type == 'text'){

                    var email = post.events[0].message.text;                    
                    
                    if(email.substr(0,1)=="@"){
                        console.log(email);
                        let rawdata = email.substr(1);
                        let data = querystring.parse(rawdata);
                        reply_id = data.from_id;
                    }                    
                    
                }

                let text ={
                    "type":"text",
                    "text":"收到了，待會會回覆您"
                }
                let reply_button =
                {
                    "type": "template",
                    "altText": "找台手機開啟",
                    "template": {
                        "type": "buttons",                            
                        "text": "請按回覆，決定回覆對象，然後輸入回覆文字，再按結束回覆，結束回覆",                            
                        "actions": [
                            {
                            "type": "postback",
                            "label": "回覆",
                            "data": "reply_id="+reply_id
                            }
                        ]
                    }
                };
    
                if(post.events[0].source.type != "group"){
                    replymessage([text]);
                }            
            if(post.events[0].source.type != "group"){

                if(type == 'image'){
                    //set adrr
                    adrr+=String(msgid);
                    adrr+=".jpg";
                    console.log(adrr);
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
                    .then((body)=>{
                        psql("SELECT * FROM SUPERVISOR;").then(
                            (groups)=>{
                                for(let group of groups){
                                    let text ={
                                        "type" : "text",
                                        "text" : "來自小隊員："
                                    }
                                    
                                        pushmessage([text],group_id);
                                    
                                    imgpusher(msg,group_id,body);
                                    
                                        pushmessage([reply_button],group_id);
                                    
                                }                            
                            }
                        );                   
                    })
                    .catch((err)=>{
                    console.log("(linebotpromise)"+err);
                    }
                    );
    
                  }else{
                    psql("SELECT * FROM SUPERVISOR;").then(
                        (groups)=>{
                            for(let group of groups){
                                let text ={
                                    "type" : "text",
                                    "text" : "來自小隊員："
                                }
                                
                                    pushmessage([text]);
                                
                                pushmessage([msg],group_id);
                                
                                    pushmessage([reply_button], group_id);
                                
                            }                            
                        }
                    );
                  }
            }
                
            }
          
            

            
      }        

    if (posttype == 'postback'){

        // record userId,reply_id pair
        let rawdata = post.events[0].postback.data;
        let data = querystring.parse(rawdata);

        if("reply_id" in data) {
            
            channel_array[post.events[0].source.userId] = data.reply_id;            
            replymessage([finish_button]);

        }else if("finish" in data){

            if( post.events[0].source.userId in channel_array){
                delete channel_array[post.events[0].source.userId];
            }            

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

function GameProceessor(req,res){
    let q = url.parse(req.url,true);
    console.log(q.query); //?game_name=
    
    let game_name = q.query.name;
    let game_index =gameanswer.indexOf(game_name);    
        let cookie = req.headers.cookie;
        psql("SELECT * FROM ACCOUNT WHERE email=\'"+cookie+"\';") //use angle_id to be the team's score
        .then(
            (req)=>{
                if(game_index!=-1){
                    if(req.length!=1){
                        psql("SELECT * FROM SUPERVISOR;").then(
                            (groups) =>{
                                for(let group of groups){
                                    pushmessage([text3],group.group_id);
                                }                            
                            }
                        );
                    }else{
                        //0.one of pair know the person will win the score 1                        
                        if(req[0].problem != game_index){
                            psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+req[0].master_id+"\';").then(
                                (res)=>{
                                    if(res[0].problem == game_index){
                                        psql("UPDATE ACCOUNT SET score="+ String(res[0].score+20) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                        //go to next problem
                                        //send next problem to partner
                                        psql("UPDATE ACCOUNT SET problem="+ String((res[0].problem+1)%gameproblem.length) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                        let msg = [
                                            {
                                                "type":"text",
                                                "text":"恭喜破關!現在小組分數為"+String(res[0].score+20)
                                            },
                                            {
                                                "type":"text",
                                                "text":"下一關的題目："+gameproblem[(res[0].problem+1)%gameproblem.length]
                                            }
                                        ]
                                        pushmessage([msg],res[0].angle_id);
                                        pushmessage([msg],res[0].master_id);
                                    }else{
                                        psql("UPDATE ACCOUNT SET score="+ String(res[0].score-1) +" WHERE angle_id=\'" + res[0].angle_id +"\';");
                                        psql("UPDATE ACCOUNT SET score="+ String(res[0].score-1) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                                        let msg = [
                                            {
                                                "type":"text",
                                                "text":"問錯人了!現在小組分數為"+String(res[0].score-1)
                                            },
                                            {
                                                "type":"text",
                                                "text":"提醒題目："+gameproblem[res[0].problem]
                                            }
                                        ]
                                        pushmessage([msg],res[0].angle_id);
                                        pushmessage([msg],res[0].master_id);
                                    }
                                }
                            );
                        }else{
                            psql("UPDATE ACCOUNT SET score="+ String(req[0].score+20) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                            psql("UPDATE ACCOUNT SET problem="+ String((req[0].problem+1)%gameproblem.length) +" WHERE angle_id=\'" + req[0].angle_id +"\';");
                            let msg = [
                                {
                                    "type":"text",
                                    "text":"恭喜破關!現在小組分數為"+String(req[0].score+20)
                                },
                                {
                                    "type":"text",
                                    "text":"下一關的題目："+gameproblem[(req[0].problem+1)%gameproblem.length]
                                }
                            ]
                            pushmessage([msg],req[0].angle_id);
                            pushmessage([msg],req[0].master_id);            
                        }                        
                        
                    }
                }else{ //4.wrong answer will let score descrese by 1
                    psql("UPDATE ACCOUNT SET score="+ String(req[0].score-1) +" WHERE email=\'"+cookie+"\';");
                    psql("UPDATE ACCOUNT SET score="+ String(req[0].score-1) +" WHERE angle_id=\'"+req[0].master_id+"\';");
                    let msg = [
                        {
                            "type":"text",
                            "text":"問錯人了!現在小組分數為"+String(req[0].score-1)
                        },
                        {
                            "type":"text",
                            "text":"提醒題目："+gameproblem[req[0].problem]
                        }
                    ]
                    pushmessage([msg],req[0].angle_id);
                    pushmessage([msg],req[0].master_id);
                }
        });
    
}


//會有other隨便亂數出來的ANSWER去扣點數

console.log("Game URL:");
for(let name of gameanswer){
    console.log("https://informationdesk.herokuapp.com/?name="+encodeURIComponent(name));
}

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen((process.env.PORT || 8080), function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//!!!240




