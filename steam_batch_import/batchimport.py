import os, time
from datetime import datetime
import requests as req
from urllib.parse import quote

BASE_URL = ".../submit.php"

def parse_date_to_timestamp(date_string):
    try:
        # Try parsing the date assuming it's in the "28 Nov" format
        date_obj = datetime.strptime(date_string, '%d %b')
    except ValueError:
        try:
            # If it fails, try parsing the date assuming it's in the "21 Sep 2021" format
            date_obj = datetime.strptime(date_string, '%d %b %Y')
        except ValueError:
            raise ValueError("Invalid date format")

    # If the year is not present in the date string, assume the current year
    if date_obj.year == 1900:
        date_obj = date_obj.replace(year=datetime.now().year)

    # Convert the datetime object to a Unix timestamp
    timestamp = int(date_obj.timestamp())
    return timestamp


FAILS = []

def urlenc(inputstr):
	return quote(inputstr)

def game_name_from_exe(exename):
	return GAME_NAMES[TRACKED_GAMES.index(exename)]

def submit(gamename, timeplayed, dateplayed):
    url = BASE_URL + "?game=" + urlenc(gamename) + "&duration=" + str(int(timeplayed)) + "&timestamp=" + str(int(dateplayed))
    #print(url)
    resp = req.get(url)
    print(resp.text)
    if "successful" not in resp.text:
        print("FAILED", gamename)
        FAILS.append(gamename)


def strtosecs(durationin):
    value,unit = durationin.split()
    value = float(value)
    if unit.lower().startswith("hour"):
        return int(value*3600)
    else:
        return int(value*60)
        


gamelines = [line.rstrip() for line in open('import.tsv', mode="r", encoding="utf-8")]
for line in gamelines:
    splitted = line.split("\t")
    
    gn = splitted[0].replace("'", "''")
    tp = splitted[1]
    dp = splitted[2].replace("Sept", "Sep") # steam prints September as Sept for some reason... while all other months are 3 chars

    secs = strtosecs(tp)
    ts = parse_date_to_timestamp(dp)

    print(gn,secs,ts)
    submit(gn,secs,ts)
    time.sleep(1) # so we dont ddos ourselves
    
print("failed games:", FAILS)
input("Press any key to exit")
