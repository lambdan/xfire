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

- Python 3

Pretty barebones for now. Doesn't need any pip libraries I think?

# Pro-tips

- Ask ChatGPT to generate SQL commands for you to convert your Steam stats :)