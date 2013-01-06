// redis.js

var redis = require('redis');
var db;
var connected = false;

exports.connect = function (host, port, pass, callback) {
	if(!connected){
		db = redis.createClient(port, host);
		db.auth(pass);

		connected = true;

		db.on('ready', function(){
			callback();
		});

		db.on('error', function(error){
			console.log("REDIS ERROR");
		});
	}else{
		callback();
	}
}

exports.test = function (host, port, pass, callback){
	if(host != null && port != null && pass != null){
		client = redis.createClient(port, host);
		client.auth(pass);

		client.on('ready', function(){
			callback(true);
			client.end();
		});
		client.on('error', function(){
			callback(false);
			client.end();
		});
	}else{
		callback(false);
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
