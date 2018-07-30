import json
import os
import sys
import webbrowser
import time

#interface variable
name=""  



#user interface
def main():
    if len(sys.argv) < 3: # 
        print("Usage:", sys.argv[0], "--era <test name>")
        sys.exit(1)       # 
    if sys.argv[1] != '--era': # 
        print("Usage:", sys.argv[0], "--era <test name>")
        sys.exit(1)       #
    global name
    name = sys.argv[2]
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/angleline/logs")
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/angleline-master/logs")
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/angleline-hall/logs")
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/informationdesk/logs")
    print("打開的分頁依序為：我的小天使、我的小主人、大祭司講堂、詢問站的伺服器後台")

def write_package_json(filename):
    # Reading data back
    with open('package.json', 'r') as f:
        data = json.load(f)

    data["main"] = filename

    # Writing JSON data
    with open('package.json', 'w') as f:
        json.dump(data, f)

if(__name__ == "__main__"):
    main()

if name == "login":
    write_package_json("idle.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline.git master"))
    time.sleep(5)
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-master.git master"))
    time.sleep(5)
    write_package_json("login.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-hall.git master"))
    time.sleep(5)
    write_package_json("info.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
'''elif name == "choose": 
elif name == "past_intro":elif name == "message":elif name == "finish":'''



