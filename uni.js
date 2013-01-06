/*
	uni.js

App entry point.

*/

var red, blue, white;
red   = '\033[31m';
blue  = '\033[34m';
green  = '\033[32m';
white = '\033[0m';
orange = '\033[33m';

console.log(blue + "UNI\t" + white + "v0.1.5");

// modules / config / static data
var fs = require('fs');
var http = require('http');

var twitter = require('./twitter.js');
var redis = require('./redis.js');
var accounts = require('./accounts.js');
var installer =  require('./installer.js');

var config = require('./config');
var mimetypes  = require('./mime-type');

// determine if UNI is correctly installed
installer.test(config, twitter, redis, accounts, init);

function init(twitterOK, redisOK, accountIsPresent){

	if(redisOK && twitterOK && accountIsPresent){
		console.log('INSTALL\t' + green + "OK" + white); 
	}else{
		console.log('INSTALL\t' + orange + "PARTIAL" + white);
	}

	// start http/io server
	http_server = http.createServer(onHTTPRequest);
	var io = require('socket.io').listen(http_server);
	http_server.listen(config.http_port);
	console.log("HTTP\t"+ green + "OK\t" + blue + config.http_port + white);
	io.set('log level', 1);
	io.sockets.on('connection', onSocketClient);

}


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
//					HTTP SERVER

function onHTTPRequest(req, res){

	// grab first element in the url to know what to do.

	request = req.url.split('/');
	switch(request[1]){
		case "skin":
			// replace 'skin' in the url by the real path of th selected skin, and continue like other static files
			request[1] = "skins/" + config.skin;
		case "js":
		case "img":
			sendFile(request.join('/'), res);
		break;
		case "favicon.ico":
			// directly end a favicon request
			res.end();
		break;
		case 'twitter':
			// receive access tokens
			twitter.receiveTokens(req);
			sendFile('/pages/close.html',res);
		break;
		default:
			// send satics html file by default
			if (installer.isReady().app) {
				sendFile('/pages/app.html',res);
			}else{
				sendFile('/pages/install.html',res);
			}
		break;
		}	
	}

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
//					SOCKET.io
function onSocketClient(socket) {

	socket.on('dataValidation', function (request) {
		socket.emit("dataValidation", {
			"id" : request.id,
			"data" : {
				"valid" : installer.isValid(request.data.value, request.data.keys)
			}
		});
	});

	socket.on('getState', function (request) {
		if(installer.isReady().app){
			socket.emit("getState", {
				"id" : request.id,
				"err": {"id": 100, "text": "Already installed"}
			});
		}else{
			installer.test(config, twitter, redis, accounts, function(twitterOK, redisOK, accountIsPresent){
				socket.emit("getState", {
					"id" : request.id,
					"data" : {
						"twitter": twitterOK,
						"redis" : redisOK,
						"account" : accountIsPresent
					}
				});
			});
		}
	});

	socket.on('setTwitterConfig', function(request){
		if(installer.isReady().twitter){
			socket.emit("setTwitterConfig", {
				"id" : request.id,
				"err": {"id": 100, "text": "Already installed"}
			});
		}else{
			installer.setTwitterConfig(request.data, twitter, config, function(valid, errors){
				socket.emit('setTwitterConfig', {
					"id": request.id,
					"data": {
						"valid" : valid,
						"validationErrors" : errors
					}
				});
			});
		}	
	});

	socket.on('setRedisConfig', function(request){
		if(installer.isReady().redis){
			socket.emit("setRedisConfig", {
				"id" : request.id,
				"err": {"id": 100, "text": "Already installed"}
			});
		}else{
			installer.setRedisConfig(request.data, redis, config, function(valid, errors){
				socket.emit('setRedisConfig', {
					"id": request.id,
					"data": {
						"valid" : valid,
						"validationErrors" : errors
					}
				});
			});
		}	
	});
}


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
//						UTILS

function sendFile(path, res){
	fs.readFile("public" + path, function(err, data){
		if(err){
			// in case of error send 404
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('404 error :\n');
			res.write(err.toString());
		}else{

			// grab extension to associate the right mime-type then send it.
			extension = path.split('.');
			extension = extension[extension.length -1];
			
			res.writeHead(200, {'Content-Type': mimetypes[extension]});
			res.write(data);	
		}
		res.end();
	});
}
