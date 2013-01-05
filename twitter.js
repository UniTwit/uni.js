// twitter.js

var module = require('node-twitter-api');
var api;
var callbacks = {}

var tokens = {}

exports.test = function (consumer_key, consumer_secret, callback_url, socket, callback){

	var conf = {
		"consumerKey": consumer_key,
		"consumerSecret": consumer_secret,
		"callback": callback_url+"/"
	}

	api = new module(conf);

	api.getRequestToken(function(error, request_token, request_token_secret, results){
		if (error) {
			console.log(error);
			callback(false);
		} else {
			socket.emit('openTwitterAuthPage', {"request_token" : request_token});
			callbacks['authPage'] = callback;
		}
	});
}

exports.receiveTokens = function(req){
	//console.log(req);
	callbacks['authPage'](true);
	callbacks['authPage'] = null;
}