// redis.js

var redis = require('redis');

exports.test = function (host, port, pass, callback){

	client = redis.createClient(port, host);
	client.auth(pass);

	client.on('ready', function(){
		callback(true);
	});
	client.on('error', function(){
		callback(false);
	});
}
