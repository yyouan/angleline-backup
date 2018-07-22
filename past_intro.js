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
                          "text": "你的"+(c_mode == 'master_id')?"小主人":"小天使"
                        }
                      ]
                    },
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {//頭貼
                          "type": "image",
                          "originalContentUrl":member[c_mode].head_url ,
                          "previewImageUrl":member[c_mode].head_url
                        },
                        {//暱稱
                          "type": "text",
                          "text": "暱稱： "+member[c_mode].nickname,
                        },                
                        {//自我介紹
                            "type": "text",
                            "text": "自我介紹： "+ member[c_mode].self_intro,
                        }                
                      ]                  
                    }            
                }
            };
            let text ={
                "type":"text",
                "text":"遊戲問題\n"
            }
            if(mode == 'angle_id'){
                text.text +=game_item.gameproblem[member.problem];
                pushmessage([msg,text],member[mode]);
            }else{
                psql("SELECT * WHERE master_id=\'"+member.master_id+"\';").then(
                    (angles)=>{
                        text.text +=game_item.gameproblem[angles[0].problem];
                        pushmessage([msg,text],member[mode]);
                    }
                );
            }

          }
        
        
      }
  )