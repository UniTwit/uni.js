/*
	uni.js

App entry point.

*/

// modules / config / static data
var colors = require('colors2');

var twitter = require('./twitter.js');
var redis = require('./redis.js');
var accounts = require('./accounts.js');
var validator = require('./validator.js');

var installer =  require('./installer.js');
var http = require('./http.js');
var websocket =  require('./websocket.js');

var config = require('./config');


console.log("uni\t".cyan + "v0.1.6\n");

// determine if UNI is correctly installed
installer.setup(config, twitter, redis, accounts)
installer.onReady(onReady);
installer.test(init);

function init(twitterOK, redisOK, accountIsPresent){

	if(!twitterOK)
		console.log('TWITTER\t' + "missing".red); 
	if(!redisOK)
		console.log('REDIS\t' + "missing".red); 
	if(!accountIsPresent)
		console.log('ACCOUNT\t'  + "missing".red);


	// start http/io server
	http.create(config, websocket.link);
	http.listen(function(){
		console.log("HTTP\t"+ "OK\t".green + config.http_port.toString().cyan);	
	});

	websocket.linkModules([twitter, redis, accounts, validator, installer]);
	//http.getActions([twitter, redis, accounts, validator, installer]);

	if(!(redisOK && twitterOK && accountIsPresent))
		console.log("\nGreat! uni is running :)\nBut it is not yet fully configured! Go to the web interface ;D\n".bold);  
}

function onReady(){
	http.disableInstaller();
}
