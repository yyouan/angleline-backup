const pngToJpeg = require('png-to-jpeg');
var express = require('express');
var request = require('request');
var path = require('path')

exports.getjpgurl = function(app,url,domain,line_id){

    return new Promise((resolve,reject)=>{

        if(path.extname(url) == '.png'){

            var options = {
                url: url,
                method: 'GET',
                headers: {},
                encoding: null
              };
              
            request(options, function (error, response, body) {

                if (!error && response.statusCode == 200) {

                    pngToJpeg({quality: 90})(body)
                    .then( img => {
                        adrr = domain + "/" + line_id + ".jpg";
                        app.get(adrr,(req,res)=>{
                            //res.sendFile(__dirname+"/img.jpg");    
                            res.writeHead(200, {'Content-Type': 'image/jpeg' });
                            res.end(img, 'binary');
                        });
                        resolve(adrr);
                    });
                                     
                }else{

                    reject("!!!!!error when recpt image!!!!!");                
                }
            });            
    
        }else{
            resolve(url);
        }

    });

    
}