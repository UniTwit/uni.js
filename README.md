uni
======

An unified interface to manage multiple Twitter accounts in team.

Powered by node.js & Redis.

<p align="center">
  <img src="https://raw.github.com/UniTwit/uni.js/master/public/img/uni.svg" alt="UNI logo"/>
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
	npm install

And finally run uni : 

	$ node uni.js
	
## Configuration
Just go on the webinterface, or edit manually `config.json` and restart uni, to provide Twitter and Redis credentials and other little things.

### Twitter
Go to [dev.twitter.com](https://dev.twitter.com/) to grab the `consumer_key` and the `consumer_secret` of an existing app, or create a new app.
Be sure the `callback_url` domain matches with the domain where is hosted uni.

### Redis
Just provide the right `host`, `port` and `pass`. The pass can be set in the Redis config file.

### Create the first account
For this, you must go on the webinterface. Just put a username and a password.
