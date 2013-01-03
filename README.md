<p align="center">
  <img src="http://files.lechatleon.com/i/UNI.png~255" alt="UNI logo"/>
</p>

uni.js
======

A unified interface to manage multiple Twitter accounts in team.

Powered by node.js & Redis

## Setup


Clone this repo : 

	git clone https://github.com/UniTwit/uni.js

Install node.js : 

	git clone https://github.com/joyent/node
	cd node/
	./configure
	make
	make install

Install Redis : 

	cd ../
	wget http://redis.googlecode.com/files/redis-2.6.7.tar.gz
	tar xzf redis-2.6.7.tar.gz
	cd redis-2.6.7
	make

And run it in screen :

	screen -d -m [src/redis-cli]

Install needed modules : 

	cd ../uni.js/
	npm install twit

And finally run it : 

	node uni.js