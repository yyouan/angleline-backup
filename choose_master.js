var express = require('express');
var request = require('request');
var url = require('url');
const querystring = require('querystring');
const token = require('./token.js');
const [AngleToken,MasterToken,HallToken,InfoToken] = [
    token.AngleToken,
    token.MasterToken,
    token.HallToken,
    token.InfoToken
]
var CHANNEL_ACCESS_TOKEN = HallToken;
var iscompleted = false;

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});

const app = express(); //建立一個express 伺服器
app.post('/' , idleParser); // POST 方法**/

var dept ={
    'phys':[],
    'psy':[]
}

psql("SELECT * FROM ACCOUNT;").then(
    sp_members =>{

        check_master(0);

        function check_master(index){

            if(index < sp_members.length){

                member = sp_members[index];
                psql("SELECT * FROM ACCOUNT WHERE master_id=\'"+member.angle_id+"\';").then(
                    angles =>{
                        
                        if(angles.length == 0){
    
                            if(member.department.replace(/\s+/g, "")=='phys'){
                                dept['psy'].push(member);
                            }else if(member.department.replace(/\s+/g, "")=='psy'){
                                dept['phys'].push(member);
                            }else{
                                console.log("department problem choose_master.js:33");
                            }
                            
                        }
                        
                        index++;
                        check_master(index);
                    }
                ).catch(
                    ()=>{index++;
                        check_master(index);}
                );
                
            }
            else{
                send_master_choosing();
            }
        }
    }
)

function send_master_choosing(){

    psql("SELECT * FROM ACCOUNT WHERE master_id=\'\';").then(
        members =>{   
    
            for(let member of members){            
    
                let a,b,c;
                let len = dept[member.department.replace(/\s+/g, "")].length;
                let department =member.department.replace(/\s+/g, "");
                let to_id = member.angle_id;
    
                if(len>3){                        
                                        
                    a = Math.floor(Math.random()*len);
                    let len2=((Math.floor(len/2)-2)<0 )?"0":(Math.floor(len/2)-2);
                    console.log(len2);            
                    b=Math.floor((Math.random()*len2+1)+a)%(len);
                    c=Math.floor((Math.random()*len2+1)+b)%(len);         
                    
                    
                    let index_arr = [a,b,c];
    
                    for(let index of index_arr){
    
                        //console.log(dept[member.department][index].head_url.replace(/\s+/g, ""));
                        
                        let bubble ={
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
                            "hero": {
                              "type": "image",
                              "url": dept[department][index].head_url.replace(/\s+/g, ""),
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {//暱稱
                                    "type": "text",
                                    "text": "暱稱： "+dept[department][index].angle_nickname.replace(/\s+/g, ""),
                                },                
                                
                              ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "button",
                                        "action": {
                                          "type": "postback",
                                          "label": "我要這個小主人",
                                          "data":"master_id="+dept[department][index].angle_id.replace(/\s+/g, "")+"&dept="+department,
                                        
                                        },
                                        "style": "primary",
                                        "color": "#0000ff"
                                      }
                                ]
                            }
                        };
                        let self_intro ={//自我介紹
                            "type": "text",
                            "text": "自我介紹： "+ dept[department][index].self_intro,
                        };
                        let msg ={  
                            "type": "flex",
                            "altText": "大講堂有消息，請借台手機開啟",
                            "contents":bubble 
                        };
        
                        pushmessage([msg,self_intro],to_id);                            
                    }
    
                }else if(len>0){
    
                    for(let cand of dept[department]){
                        let bubble ={
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
                            "hero": {
                              "type": "image",
                              "url": cand.head_url.replace(/\s+/g, ""),
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {//暱稱
                                    "type": "text",
                                    "text": "暱稱： "+cand.angle_nickname.replace(/\s+/g, ""),
                                },                
                                
                              ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "button",
                                        "action": {
                                          "type": "postback",
                                          "label": "我要這個小主人",
                                          "data":"master_id="+cand.angle_id.replace(/\s+/g, "")+"&dept="+department,                                             
                                        },
                                        "style": "primary",
                                        "color": "#0000ff"
                                      }
                                ]
                            }
                        };
                        let self_intro ={//自我介紹
                            "type": "text",
                            "text": "自我介紹： "+ cand.self_intro,
                        };
                        let msg ={  
                            "type": "flex",
                            "altText": "大講堂有消息，請借台手機開啟",
                            "contents":bubble 
                        };
        
                        pushmessage([msg,self_intro],to_id);
                    }
                }else{
                    let c_dept = (department == 'phys')? ('psy'):('phys')
    
                    console.log("c_dept_length"+dept[ c_dept ].length);
    
                    for(let cand of dept[ c_dept ]){
    
                        let bubble ={
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
                            "hero": {
                              "type": "image",
                              "url": cand.head_url.replace(/\s+/g, ""),
                            },
                            "body": {
                              "type": "box",
                              "layout": "vertical",
                              "contents": [
                                {//暱稱
                                    "type": "text",
                                    "text": "暱稱： "+cand.angle_nickname.replace(/\s+/g, ""),
                                },                
                                
                              ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "button",
                                        "action": {
                                          "type": "postback",
                                          "label": "我要這個小主人",
                                          "data":"master_id="+cand.angle_id.replace(/\s+/g, "")+"&dept="+department+"&counter=1",                                             
                                        },
                                        "style": "primary",
                                        "color": "#0000ff"
                                      }
                                ]
                            }
                        };
                        let self_intro ={//自我介紹
                            "type": "text",
                            "text": "自我介紹： "+ cand.self_intro,
                        };
                        let msg ={  
                            "type": "flex",
                            "altText": "大講堂有消息，請借台手機開啟",
                            "contents":bubble 
                        };
        
                        pushmessage([msg,self_intro],to_id);
                    }
                }
                
                
            }
    
            //app.post('/' , choose_Parser); // POST 方法**/  
            iscompleted = true;
        }
    );
}
//1.send candidate:


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

    if(iscompleted){
        choose_Parser(req,res);
    }else{
        //route
        //var nwimg;
        const domain="https://angleline.herokuapp.com";  
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

}

//2.choose
function choose_Parser(req ,res){
        //route
        //var nwimg;
        const domain="https://angleline-hall.herokuapp.com";  
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
            /**var userMessage = post.events[0].message.text;
            console.log(replyToken);
            console.log(userMessage);**/
            if (typeof replyToken === 'undefined') {
                return;
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

            if (posttype == 'postback'){                

                var data = querystring.parse(post.events[0].postback.data);
                var master_id = data.master_id;
                var department = data.dept;
                psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+line_id+"\';").then(
                    res => {
                        if(res[0].master_id.replace(/\s+/g, "")!=""){

                            let text ={
                                "type":"text",
                                "text":"你已經選過了，不能再按按鈕了喔!"
                            }
                            replymessage([text]);

                        }else{
                            if('counter' in data){
                                department = (department == 'phys')? ('psy'):('phys')
                            }
                            if(dept[department].findIndex((ele)=>{return ele.angle_id.replace(/\s+/g, "") == master_id}) == -1 ){

                                let a,b,c;
                                let len = dept[department].length;
                                let to_id = line_id;
            
                                if(len>3){                        
                                    
                                    a = Math.floor(Math.random()*len);
                                    let len2=((Math.floor(len/2)-2)<0 )?"0":(Math.floor(len/2)-2);
                                    console.log(len2);            
                                    b=Math.floor((Math.random()*len2+1)+a)%(len);
                                    c=Math.floor((Math.random()*len2+1)+b)%(len);            
                                    
                                    let index_arr = [a,b,c];
            
                                    for(let index of index_arr){
            
                                        //console.log(dept[member.department][index].head_url.replace(/\s+/g, ""));
                                        
                                        let bubble ={
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
                                            "hero": {
                                              "type": "image",
                                              "url": dept[department][index].head_url.replace(/\s+/g, ""),
                                            },
                                            "body": {
                                              "type": "box",
                                              "layout": "vertical",
                                              "contents": [
                                                {//暱稱
                                                    "type": "text",
                                                    "text": "暱稱： "+dept[department][index].angle_nickname.replace(/\s+/g, ""),
                                                },                
                                                
                                              ]
                                            },
                                            "footer": {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "button",
                                                        "action": {
                                                          "type": "postback",
                                                          "label": "我要這個小主人",
                                                          "data":"master_id="+dept[department][index].angle_id.replace(/\s+/g, "")+"&dept="+department,
                                                        
                                                        },
                                                        "style": "primary",
                                                        "color": "#0000ff"
                                                      }
                                                ]
                                            }
                                        };
                                        let self_intro ={//自我介紹
                                            "type": "text",
                                            "text": "自我介紹： "+ dept[department][index].self_intro,
                                        };
                                        let msg ={  
                                            "type": "flex",
                                            "altText": "大講堂有消息，請借台手機開啟",
                                            "contents":bubble 
                                        };
                        
                                        pushmessage([msg,self_intro],to_id);                            
                                    }
            
                                }else if(len>0){
            
                                    for(let cand of dept[department]){
                                        let bubble ={
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
                                            "hero": {
                                              "type": "image",
                                              "url": cand.head_url.replace(/\s+/g, ""),
                                            },
                                            "body": {
                                              "type": "box",
                                              "layout": "vertical",
                                              "contents": [
                                                {//暱稱
                                                    "type": "text",
                                                    "text": "暱稱： "+cand.angle_nickname.replace(/\s+/g, ""),
                                                },                
                                                
                                              ]
                                            },
                                            "footer": {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "button",
                                                        "action": {
                                                          "type": "postback",
                                                          "label": "我要這個小主人",
                                                          "data":"master_id="+cand.angle_id.replace(/\s+/g, "")+"&dept="+department,                                             
                                                        },
                                                        "style": "primary",
                                                        "color": "#0000ff"
                                                      }
                                                ]
                                            }
                                        };
                                        let self_intro ={//自我介紹
                                            "type": "text",
                                            "text": "自我介紹： "+ cand.self_intro,
                                        };
                                        let msg ={  
                                            "type": "flex",
                                            "altText": "大講堂有消息，請借台手機開啟",
                                            "contents":bubble 
                                        };
                        
                                        pushmessage([msg,self_intro],to_id);
                                    }
                                }else{
                                    if('counter' in data){
                                       //won't happen 
                                    }else{
                                        let c_dept = (department == 'phys')? ('psy'):('phys')

                                        for(let cand of dept[ c_dept ]){
                                            let bubble ={
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
                                                "hero": {
                                                "type": "image",
                                                "url": cand.head_url.replace(/\s+/g, ""),
                                                },
                                                "body": {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {//暱稱
                                                        "type": "text",
                                                        "text": "暱稱： "+cand.angle_nickname.replace(/\s+/g, ""),
                                                    },                
                                                    
                                                ]
                                                },
                                                "footer": {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "button",
                                                            "action": {
                                                            "type": "postback",
                                                            "label": "我要這個小主人",
                                                            "data":"master_id="+cand.angle_id.replace(/\s+/g, "")+"&dept="+department+"&counter=1",                                             
                                                            },
                                                            "style": "primary",
                                                            "color": "#0000ff"
                                                        }
                                                    ]
                                                }
                                            };
                                            let self_intro ={//自我介紹
                                                "type": "text",
                                                "text": "自我介紹： "+ cand.self_intro,
                                            };
                                            let msg ={  
                                                "type": "flex",
                                                "altText": "大講堂有消息，請借台手機開啟",
                                                "contents":bubble 
                                            };
                            
                                            pushmessage([msg,self_intro],to_id);
                                        }
                                    }
                                    
                                }

                                let text ={
                                    "type":"text",
                                    "text":"太可惜了，你選定的小主人被選走了，再選一個有緣的吧!(上一輪出現的也可以再選喔)"
                                }
                                replymessage([text]);                    
            
                            }else{    
                                psql("UPDATE ACCOUNT SET master_id=\'"+ master_id +"\' WHERE angle_id=\'" + line_id +"\';");
                                var index =dept[department].findIndex((ele)=>{return ele.angle_id.replace(/\s+/g, "")==master_id});
                                console.log(index);
                                console.log(department);
                                console.log(dept[department]);
                                console.log(dept[department][index]);
                                for(let mem of dept[department]){
                                    console.log(master_id);
                                    console.log(mem.angle_id.replace(/\s+/g, ""));
                                }
                                dept[department].splice(dept[department].findIndex((ele)=>{return ele.angle_id.replace(/\s+/g, "")==master_id}),1);
                                console.log("choose successful");
                                console.log(dept[department].length);
                                psql("SELECT * FROM ACCOUNT WHERE angle_id=\'"+ master_id +"\';").then(
                                    res =>{
                                        psql("UPDATE ACCOUNT SET master_name=\'"+ res[0].name +"\' WHERE angle_id=\'" + line_id +"\';");
                                        psql("UPDATE ACCOUNT SET master_group="+ res[0].groupindex +" WHERE angle_id=\'" + line_id +"\';");
                                    }
                                );
                                let text ={
                                    "type":"text",
                                    "text":"恭喜你選到你的小主人!"
                                }
                                replymessage([text]);
                            }

                        }
                    }
                )

                

            }
            
            if (posttype == 'message' && post.events[0].source.type != 'group'){            
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
            
        });
    
    }

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen((process.env.PORT || 8080), function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//!!!240