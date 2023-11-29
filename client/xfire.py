import os, time
import requests as req
from urllib.parse import quote

BASE_URL = ".../submit.php"
INTERVAL = 15

def urlenc(inputstr):
	return quote(inputstr)

def game_name_from_exe(exename):
	return GAME_NAMES[TRACKED_GAMES.index(exename)]

def submit(exename, duration):
    #print("submit:",exename,duration)
    url = BASE_URL + "?game=" + urlenc(game_name_from_exe(exename)) + "&duration=" + str(int(duration)) + "&timestamp=" + str(int(time.time()))
    resp = req.get(url)
    print(resp.text)

def get_running_exes(): # https://www.geeksforgeeks.org/python-get-list-of-running-processes/
	wmic_output = os.popen('wmic process get description, processid').read().strip() 
	# TODO: can get path by using ExecutablePath (useful for games using same .exe name, like re3)
	items = wmic_output.split("\n")
	exes = []
	for line in items:
		if ".exe" in line.strip():
			exe = line.split("   ")[0].rstrip()
			#print(exe)
			exes.append(exe)
	return exes


gamelines = [line.rstrip() for line in open('games.txt')]

TRACKED_GAMES = []
GAME_NAMES = []
for line in gamelines:
	GAME_NAMES.append(line.split(",")[0])
	TRACKED_GAMES.append(line.split(",")[1])

RUNNING_GAMES = []
TIME_STARTED = []

print("tracking:", TRACKED_GAMES)

while True:
    running = get_running_exes()

    for exe in running:
        if exe in TRACKED_GAMES:
            if exe not in RUNNING_GAMES:
                RUNNING_GAMES.append(exe)
                TIME_STARTED.append(time.time())
                print("+", game_name_from_exe(exe), "(" + exe + ")", "started");
            else:
                print("*", game_name_from_exe(exe), "(" + exe + ")", "running...")
                submit(exe,INTERVAL)
    
    for exe in RUNNING_GAMES:
        if exe not in running:
            print("-", game_name_from_exe(exe), "(" + exe + ")", "quit")
            idx = RUNNING_GAMES.index(exe)
            duration = time.time() - TIME_STARTED[idx]
            RUNNING_GAMES.pop(idx)
            TIME_STARTED.pop(idx)
            #submit(exe,duration)
            submit(exe,INTERVAL)

    time.sleep(INTERVAL)
