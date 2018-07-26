function submit(){
    alert("上傳成功，請回到line對話框輸入註冊的郵件信箱");
    window.open('https://line.me/R/ti/p/%40kni2367i');
}
var feedback = function(res) {
    if (res.success === true) {
        var get_link = res.data.link.replace(/^http:\/\//i, 'https://');
        document.querySelector('.status').classList.add('bg-success');      
       
        document.querySelector('.status').innerHTML =
            '<img class="img" alt="Imgur-Upload" src=\"' + get_link + '\"/>'
            //+'<form onsubmit=\'submit()\' action="/img?" method="post">'+
              //'<input name=\"email\" style=\"visibility : hidden\" type=\'text\' value=\''+document.cookie+'\'>'
            //+ '<input name=\"url\" style=\"visibility : hidden\" type=\'text\' value=\''+get_link+'\'>'
            +'<input id=\"subbut\" type=\'button\' value=\"\">';
        $("#subbut").click(()=>{
            let array = decodeURIComponent(document.cookie).split(';');
            let jsonthing={}
            for(let str of array){
                let raw = str.split('=');
                if(raw.length == 2){
                    jsonthing[raw[0]]=raw[1];
                }
            }
            $.post("/img",
            {
                
                email: jsonthing['email'],
                url: get_link
            },
            function(data,status){                
            });
            submit();
        });

        document.getElementsByClassName('dropzone')[0].style.visibility ='hidden';
        document.getElementsByClassName('status')[0].style.position ='absolute';
        document.getElementsByClassName('status')[0].style.top ='20%'; 
        document.getElementsByClassName('status')[0].style.left ='25%';        
        document.getElementById('subbut').style = "opacity: 0.0; width: 300%; padding: 300%; position: absolute; top: 0%; right:-100%" ;        
    }
};

new Imgur({
    clientid: '4409588f10776f7', //You can change this ClientID
    callback: feedback
});