// redis.js

var redis = require('redis');
var db;
var connected = false;

exports.getActions = function(addAction){
}

exports.connect = function (host, port, pass, callback) {
	if(!connected){
		db = redis.createClient(port, host);
		db.auth(pass);

		connected = true;

		db.on('ready', function(){
			callback();
		});

		db.on('error', function(error){
			console.log("REDIS ERROR".red);
		});
	}else{
		callback();
	}
}

exports.test = function (host, port, pass, callback){
	callbackTriggered = false;
	if(host != null && port != null && pass != null){
		client = redis.createClient(port, host);
		client.auth(pass);

		client.on('ready', function(e){
			client.end();
			callback(true);
			callbackTriggered = true;
		});

		client.on('error', function(e){
			if(!callbackTriggered){
				callback(false);
				callbackTriggered = true;
			}else{
				//client.end();
				// can't close connection -> get a unhandled error...
			}
			delete client;
		});
	}else{
		if(!callbackTriggered){
			callback(false);
			callbackTriggered = true;
		}
	}
}

exports.getAccounts = function (callback) {
	db.SMEMBERS('accounts', function(err, data){
		callback(data);
	})
}

exports.createAccount = function(username, data, callback){
	db.SADD('accounts','username', function(err,data){
		callback(data);
	})
}
