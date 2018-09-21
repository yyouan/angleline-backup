import json
import os
import sys
import webbrowser
import time

'''

command : python log.py

'''

while True:
    os.system("heroku logs -n 1500 --app angleline-hall >> ../hall_logs.txt")
    os.system("heroku logs -n 1500 --app angleline >> ../angle_logs.txt")
    os.system("heroku logs -n 1500 --app angleline-master >> ../master_logs.txt")
    os.system("heroku logs -n 1500 --app informationdesk >> ../info_logs.txt")
    print('Running on background ...')
    time.sleep(60*10)
