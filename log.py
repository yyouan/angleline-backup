import json
import os
import sys
import webbrowser
import time

while True:
    os.system("heroku logs -n 1500 >> logs.txt")
    print('Running on background ...')
    time.sleep(60*10)
