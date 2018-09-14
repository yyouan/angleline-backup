function submit(){
    alert("上傳成功，請回到line對話框輸入註冊的郵件信箱");   
}
var feedback = function(res) {
    if (res.success === true) {
        var get_link = res.data.link.replace(/^http:\/\//i, 'https://');
        document.querySelector('.status').classList.add('bg-success');      
       
        document.querySelector('.status').innerHTML =
            '<input id=\"subbut\" type=\'button\' value=\"確認上傳\">'
            +'<input id=\"reload\" type=\'button\' value=\"重新上傳\">'
            +'<img class="img2" alt="Imgur-Upload" src=\"' + get_link + '\"/ width="30%">';
        $("#reload").click(
            ()=>{
                window.location.reload();
            }
        )
        $("#subbut").click(()=>{
            if(document.cookie == ""){
                document.cookie = "email=" + prompt("請輸入註冊用的電子郵件信箱：")
            }
            let array = decodeURIComponent(document.cookie).split(';');
            let jsonthing={}
            for(let str of array){
                let raw = str.split('=');
                if(raw.length == 2){
                    jsonthing[raw[0].replace(/\s+/g, "")]=raw[1];
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
        document.getElementsByClassName('img2')[0].style ="position: fixed;top: 80%;left:20%"                
        document.getElementById('subbut').style = "background-color:lightgray;color:black;border: 5px solid #FF0000;font-size:300%;position: fixed;top: 40%;left:15%" ;
        document.getElementById('reload').style = "background-color:lightgray;color:black;border: 5px solid #8B4513;font-size:300%;position: fixed;top: 60%;left:15%" ;        
    }
};

new Imgur({
    clientid: '4409588f10776f7', //You can change this ClientID
    callback: feedback
});