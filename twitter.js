// twitter.js

var module = require('node-twitter-api');
var api;
var callbacks = {};

var tokens = {};
var timeout = 30000;

var getRequestToken;

exports.getActions = function(addAction){
}

exports.test = function(consumer_key, consumer_secret, callback_url, callback){
	if(consumer_key != null && consumer_secret != null && callback_url != null){
		var conf = {
			"consumerKey": consumer_key,
			"consumerSecret": consumer_secret,
			"callback": callback_url+"/"
		}

		var test = new module(conf);

		test.getRequestToken(function(err, request_token, request_token_secret, request_token, results){
			if(err){
				callback(false);
			}else{
				callback(true);
			}
		});
	}else{
		callback(false);
	}
}

exports.setupAPI = function(consumer_key, consumer_secret, callback_url){
	tokens = {
		"consumerKey": consumer_key,
		"consumerSecret": consumer_secret,
		"callback": callback_url+"/"
	}

	api = new module(tokens);
}

exports.getUserToken = function (socket, callback){

	api.getRequestToken(function(error, request_token, request_token_secret, results){
		if (error) {
			console.log(error);
			callback(false);
		} else {
			socket.emit('openTwitterAuthPage', {"request_token" : request_token});
			callbacks['receiveTokens'] = callback;
			setTimeout(function(){
				console.log('Twitter time out');
				if(callbacks['receiveTokens'] != null){
					callbacks['receiveTokens'](false);
					socket.emit('closeTwitterAuthPage', {});	
				}
			}, timeout);
		}
	});
}

exports.receiveTokens = function(req){
	console.log(req);
	callbacks['receiveTokens'](true);
	callbacks['receiveTokens'] = null;
	// LOT OF WORK TODO HERE
}
