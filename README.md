uni.js
======

A unified interface to manage multiple Twitter accounts in team.

Powered by node.js & Redis

<p align="center">
  <img src="https://raw.github.com/UniTwit/uni.js/master/public/img/uni_487x230.png" alt="UNI logo"/>
</p>

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

	screen -d -m src/redis-server

Install needed modules : 

	cd ../uni.js/
	npm install twit node-twitter-api
	npm install redis
	npm install socket.io -g

And finally run uni : 

	node uni.js
