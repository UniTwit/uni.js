// redis.js

var redis = require('redis');

exports.test = function (host, port, pass, callback){
	if(host != null && port != null && pass != null){
		client = redis.createClient(port, host);
		client.auth(pass);

		client.on('ready', function(){
			callback(true);
		});
		client.on('error', function(){
			callback(false);
		});
	}else{
		callback(false);
	}
}
