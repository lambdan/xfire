#include <curl/curl.h>
#include <windows.h>
#include <tlhelp32.h>
#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <algorithm>


// params
std::string BASE_URL = "  ";
std::string GAMES_FILE = "  ";
bool VERBOSE = true;
int INTERVAL = 15;

std::string CONFIG_FILE = "config.ini";

// dont touch
struct Game{
	std::string gameName;
	std::string gameExe;
};

std::vector<Game> games;
std::vector<std::string> running;
std::vector<std::string> playingTitles;
std::vector<std::string> playingExes;


void GrabRunningProcesses() {
	running.clear();
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) {
        std::cerr << "Error creating process snapshot. Error code: " << GetLastError() << std::endl;
        return;
    }

    PROCESSENTRY32 processEntry;
    processEntry.dwSize = sizeof(PROCESSENTRY32);

    if (Process32First(hSnapshot, &processEntry)) {
        do {
		running.push_back(processEntry.szExeFile);
        } while (Process32Next(hSnapshot, &processEntry));
    } else {
        std::cerr << "Error retrieving process information. Error code: " << GetLastError() << std::endl;
    }

    CloseHandle(hSnapshot);
}

bool ParseTSV()
{
	std::ifstream f;
	std::string line;
	f.open(GAMES_FILE);
	if(!f.is_open())
	{
		return false;
	}
	while (getline(f, line))
	{
		if(line == "")
		{
			continue;
		}
		std::vector<std::string> tokens;

		std::istringstream iss(line);
		std::string token;
		while(std::getline(iss, token, '\t'))
		{
			tokens.push_back(token);
		}

		Game g;
		g.gameName = tokens[0];
		g.gameExe = tokens[1];
		games.push_back(g);
	}
	return true;
}

void hexchar(unsigned char c, unsigned char &hex1, unsigned char &hex2)
{
    hex1 = c / 16;
    hex2 = c % 16;
    hex1 += hex1 <= 9 ? '0' : 'a' - 10;
    hex2 += hex2 <= 9 ? '0' : 'a' - 10;
}

bool vectorContains(std::string s, std::vector<std::string> v)
{
	if(std::find(v.begin(), v.end(), s) != v.end())
	{
		return true;
	}
	return false;
}

std::string URLEncode(std::string s) // https://gist.github.com/litefeel/1197e5c24eb9ec93d771
{
    const char *str = s.c_str();
	std::vector<char> v(s.size());
	v.clear();
    for (size_t i = 0, l = s.size(); i < l; i++)
    {
        char c = str[i];
        if ((c >= '0' && c <= '9') ||
            (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c == '-' || c == '_' || c == '.' || c == '!' || c == '~' ||
            c == '*' || c == '(' || c == ')')
        {
            v.push_back(c);
        }
        else if (c == ' ')
        {
//            v.push_back('+');
			v.push_back('%');
			v.push_back('2');
			v.push_back('0');
		}
		else if (c == '\'')
		{
			v.push_back('\'');
			v.push_back('\'');
		}
		else
        {
            v.push_back('%');
            unsigned char d1, d2;
            hexchar(c, d1, d2);
            v.push_back(d1);
            v.push_back(d2);
        }
    }

    return std::string(v.cbegin(), v.cend());
}

long CurrentTimestamp()
{
	std::time_t result = std::time(nullptr);
	return result;
}

int curlPing(std::string url)
{
	CURL *curl;
	CURLcode res;
	curl = curl_easy_init();
	if (curl)
	{
		curl_easy_setopt(curl, CURLOPT_CAINFO, "cacert.pem");
		curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
		curl_easy_setopt(curl, CURLOPT_HTTP_VERSION, (long)CURL_HTTP_VERSION_3);
		res = curl_easy_perform(curl);
		if (res != CURLE_OK)
		{
			fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
			curl_easy_cleanup(curl);
			return 1;
		}

		curl_easy_cleanup(curl);
		return res;
	}
	return 1;
}

void Submit(std::string GameName, int timestamp = CurrentTimestamp(), int duration = INTERVAL)
{

	std::string url = BASE_URL + "&game=" + URLEncode(GameName) + "&duration=" + std::to_string(duration) + "&timestamp=" + std::to_string(timestamp);
	if (VERBOSE)
	{
		std::cout << "Submitting " << GameName << " (" << duration << " secs, timestamp: " << timestamp << ")" << std::endl;
		std::cout << url << std::endl;
	}
	curlPing(url);
}

bool ParseSetting(std::string key, std::string val)
{
	if(key == "baseurl"){
		BASE_URL = val;
		return true;
	}
	
	if(key == "interval")
	{
		INTERVAL = stoi(val);
		return true;
	}

	if(key == "gamesfile")
	{
		GAMES_FILE = val;
		return true;
	}

	if(key == "verbose")
	{
		if(val == "true")
		{
			VERBOSE = true;
		}
		else {
			VERBOSE = false;
		}
		return true;
	}

	std::cout << "ERROR: Unrecognized key in config file: " << key << std::endl;
	return false;
}

bool ParseSettings()
{
	std::cout << "Reading settings from " << CONFIG_FILE << std::endl;

	std::ifstream f;
	std::string line;
	f.open(CONFIG_FILE);
	if(!f.is_open())
	{
		perror("Failed opening config file");
		return false;
	}
	while (std::getline(f, line))
	{
		std::istringstream is_line(line);
		std::string key;
		if(std::getline(is_line,key, '='))
		{
			std::string value;
			if(std::getline(is_line,value))
			{
				if(!ParseSetting(key,value)){
					return false;
				}
			}
		}
	}

	return true;
}

int main() 
{
	if(ParseSettings() == false)
	{
		std::cout << "Failed reading settings, quitting..." << std::endl;
		return 1;
	}

	if(ParseTSV() == false)
	{
		std::cout << "Failed reading " << GAMES_FILE << std::endl;
		return 1;
	}

	std::cout << "Tracked games: ";
	for(auto & a : games)
	{
		std::cout << a.gameName << ", ";
	}
	std::cout << std::endl;
	std::cout << std::endl;

	playingTitles.clear();
	playingExes.clear();

	while(true)
	{
		GrabRunningProcesses();

		for(auto & p : running)
		{
			for(auto & g : games)
			{
				if(p == g.gameExe)
				{

					if (vectorContains(g.gameExe, playingExes)){
						if(VERBOSE)
						{
							std::cout << "Still playing " << g.gameName << std::endl;
						}
					}
					else{
						if(VERBOSE)
						{
							std::cout << "Started playing " << g.gameName << std::endl;
						}
						playingExes.push_back(g.gameExe);
						playingTitles.push_back(g.gameName);
					}
					Submit(g.gameName);
				}
			}
		}

		for (int i = 0; i < playingExes.size(); i++){
			if(vectorContains(playingExes[i], running) == false)
			{
				if(VERBOSE)
				{
					std::cout << "Stopped playing " << playingTitles[i] << std::endl;
				}
				Submit(playingTitles[i]);
				playingExes.erase(playingExes.begin() + i);
				playingTitles.erase(playingTitles.begin() + i);
				if(VERBOSE)
				{
					std::cout << std::endl;
				}
			}
		}

		Sleep(INTERVAL * 1000);
	}

	return 0;
}

