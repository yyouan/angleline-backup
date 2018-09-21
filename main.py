import json
import os
import sys
import webbrowser
import time

##please "cosole => login => choose => past => message => finish" (no need to in order)
##lang:
'''
    python main.py --era console
    python main.py --era login
    python main.py --era check:head_url
    python main.py --era check:login    
    python main.py --era choose
    python main.py --era check:master
    python main.py --era past
    python main.py --era message
    python main.py --era finish
    python main.py --era show
    python main.py --era idle

    if check has problem call them to re-login or --era choose again
    
'''

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

if name =="show":
    print("log out file is on list.txt")
    print(os.system("heroku pg:psql --app angleline < main.sql > list.txt"))
    #print(os.system("heroku pg:psql --app angleline < main.sql"))
    print(os.system("notepad list.txt"))

if name == "pair":
    print("log out file is on pair.txt")
    print(os.system("heroku pg:psql --app angleline < main.sql > pair.txt"))
    #print(os.system("heroku pg:psql --app angleline < pair.sql"))
    print(os.system("notepad pair.txt"))

if name =="console":
    print("please open browser first!")    
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/angleline/logs")
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/angleline-master/logs")
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/angleline-hall/logs")
    webbrowser.open_new_tab("https://dashboard.heroku.com/apps/informationdesk/logs")
    print(os.system("git add ."))
    print(os.system("git commit -m \"ab\""))
    print(os.system("git config --global user.name \"yyouan\""))
    print(os.system("git pull https://github.com/yyouan/angleline-backup.git master")) 
    print(os.system("git pull https://github.com/yyouan/angleline.git master"))
    print(os.system("git pull https://github.com/yyouan/angleline-master.git master"))
    print(os.system("git pull https://github.com/yyouan/angleline-hall.git master"))
    print(os.system("git pull https://github.com/yyouan/informationdesk.git master"))    
    '''for router'''
    '''line only need to res success for one time then we can change to other server'''
    '''end'''
    print("please fix conflict problem in package.json")
    print("please input:SELECT * FROM ACCOUNT; afer >>  (DELETE USE DELETE enter enter ;)")
    print(os.system("heroku pg:psql --app angleline < main.sql > list.txt"))
    print(os.system("notepad list.txt"))
    
elif name == "check:master":    
    print(os.system("heroku pg:psql --app angleline < check_master.sql > master.txt"))    
    print(os.system("notepad master.txt"))
    write_package_json("check_master.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(30)
    write_package_json("info.js")    
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))

elif name == "check:login":
    print(os.system("heroku pg:psql --app angleline < check_self_intro.sql > self_intro.txt"))    
    print(os.system("notepad self_intro.txt"))    
    write_package_json("check.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(30)
    write_package_json("info.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))
    
elif name == "check:head_url":
    print(os.system("heroku pg:psql --app angleline < check_head_url.sql > head_url.txt"))    
    print(os.system("notepad head_url.txt"))

elif name == "login":
    print("please deploy angleline-hall again to avoid problem!")
    write_package_json("idle_angle.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline.git master"))
    time.sleep(5)
    write_package_json("idle_master.js")
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
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))
elif name == "choose":   
    print(os.system("heroku pg:psql --app angleline < check_self_intro.sql"))
    print(os.system("heroku pg:psql --app angleline < check_head_url.sql"))    
    write_package_json("choose_master.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-hall.git master"))
    time.sleep(5)    
    write_package_json("idle_angle.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline.git master"))
    time.sleep(5)
    write_package_json("idle_master.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-master.git master"))
    time.sleep(5)
    write_package_json("info.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))        

elif name == "past":
    print(os.system("heroku pg:psql --app angleline < check_master.sql"))
    write_package_json("past_intro_angle.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline.git master"))
    time.sleep(5)
    write_package_json("past_intro_master.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-master.git master"))
    time.sleep(5)
    write_package_json("hall.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-hall.git master"))
    time.sleep(5)
    write_package_json("info.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))

elif name == "message":
    write_package_json("postman_angle.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline.git master"))
    time.sleep(5)
    write_package_json("postman_master.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-master.git master"))
    time.sleep(5)
    write_package_json("hall.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-hall.git master"))
    time.sleep(5)
    write_package_json("info.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))

elif name == "finish":
    write_package_json("exchange_id_angle.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline.git master"))
    time.sleep(5)
    write_package_json("exchange_id_master.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-master.git master"))
    time.sleep(5)
    write_package_json("hall.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-hall.git master"))
    time.sleep(5)
    write_package_json("info.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
    print("log out file is on pair.txt")
    print(os.system("heroku pg:psql --app angleline < pair.sql > pair.txt"))
    print(os.system("heroku pg:psql --app angleline < pair.sql"))
    print(os.system("notepad pair.txt"))
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))

elif name == "idle":
    print("please deploy angleline-hall again to avoid problem!")
    write_package_json("idle_angle.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline.git master"))
    time.sleep(5)
    write_package_json("idle_master.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-master.git master"))
    time.sleep(5)
    write_package_json("hall.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/angleline-hall.git master"))
    time.sleep(5)
    write_package_json("info.js")
    print(os.system("git add ."))
    print(os.system("git commit -m \"login\""))
    print(os.system("git push https://github.com/yyouan/informationdesk.git master"))
    time.sleep(5)
    print(os.system("git push https://github.com/yyouan/angleline-backup.git master"))
