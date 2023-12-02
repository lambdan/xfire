# xfire

Reboot of [rip_xfire](https://github.com/lambdan/rip_xfire), using an online PHP server instead of just doing everything client side.

See my stats here for instance: https://lambdan.se/d/xfire/

I'll explain this more detailed eventually.

# Setup

## Server

Tested on:

- PHP 7.4
- Apache2
- Debian 4.19.269-1

Make sure whatever user/group that runs your webserver has access to the folder that the db lives in. Gives errors otherwise.

## Client

- Written in C++
- Uses libcurl

Reads games from a `.tsv` file, where the format is this:

```
Game Title  game.exe
Red Dead Redemption 2  RDR2.exe
```

i.e. `Game Title<TAB>Executable`

Also needs a valid `config.ini`:

```
baseurl=https://someaddr.com/submit.php // this is where we will submit (&game=, &duration=, &timestamp= will be appended)
interval=15 // how often to check for running games and submitting
gamesfile=games.tsv // the tsv file explained above
verbose=true // prints alot of stuff
```

# Pro-tips

- Ask ChatGPT to generate SQL commands for you to convert your Steam stats :)
