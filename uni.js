/*
	uni.js

App entry point.

*/

var red, blue, white;
red   = '\033[31m';
blue  = '\033[34m';
green  = '\033[32m';
white = '\033[0m';

console.log(red + "UNI" + green + "\nv0.1.0004"+ white);



// modules / config / static data
var fs = require('fs');
var http = require('http');

var twitter = require('./twitter.js');
var redis = require('./redis.js');

var config = require('./config');
var mimetypes  = require('./mime-type');
var	dataSchem  = require('./dataSchem');

// start http/io server
http_server = http.createServer(onRequest)
var io = require('socket.io').listen(http_server);
http_server.listen(config.http_port);
console.log("HTTP "+ green + "OK " + blue + config.http_port + white);

// determine if UNI is correctly installed
var installed = config.twitter.consumer_key !== null && config.twitter.consumer_secret !== null;
if(installed)
	console.log('INSTALL '+ green + "OK" + white);
else
	console.log('INSTALL '+ red + "BAD" + white);


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
//					HTTP SERVER

function onRequest(req, res){

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
			if (installed) {
				sendFile('/pages/app.html',res);
			}else{
				sendFile('/pages/install.html',res);
			}
		break;
		}	
	}

	/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
//					SOCKET.io

io.set('log level', 1);

io.sockets.on('connection', function (socket) {

	socket.on('dataValidation', function (request) {
		socket.emit("dataValidation", {
			"id" : request.id,
			"data" : {
				"valid" : isValid(request.data.value, request.data.keys)
			}
		});
	});

	socket.on('getConfig', function (request) {
		if(!installed){
			socket.emit("getConfig", {
				"id" : request.id,
				"data" : {
					"key" : config.twitter.consumer_key,
					"secret" : config.twitter.consumer_secret,
					"host" : config.redis.host,
					"port" : config.redis.port
				}
			});
		}else{
			socket.emit("getConfig", {
				"id" : request.id,
				"err": {"id": 100, "text": "Already installed"}
			});
		}
	});

	socket.on('setConfig', function (request){
		if(!installed){

			var validationErrors = {};
			var valid = true;

			if(request.data.key != undefined){
				if(!isValid(request.data.key, ['twitter','consumer_key'])){
					validationErrors["key"] = "consumer_key has an invalid format.";
					valid = false;	
				}
			}else{
				validationErrors["key"] = "consumer_key not provided";
				valid = false;
			}

			if(request.data.secret != undefined){
				if(!isValid(request.data.secret, ['twitter','consumer_secret'])){
					validationErrors["secret"] = "consumer_secret has an invalid format.";
					valid = false;	
				}
			}else{
				validationErrors["secret"] = "consumer_secret not provided";
				valid = false;
			}

			if(request.data.port != undefined){
				if(!isValid(request.data.port, ['port'])){
					validationErrors["port"] = "port has an invalid format.";
					valid = false;	
				}
			}else{
				validationErrors["port"] = "port not provided";
				valid = false;
			}

			if(request.data.host == ""){
				validationErrors["host"] = "host not provided";
				valid = false;
			}

			if(request.data.pass == ""){
				validationErrors["pass"] = "pass not provided";
				valid = false;
			}

			if(!valid){
				socket.emit("setConfig", {
					"id": request.id,
					"data": {
						"valid" : false,
						"validationErrors" : validationErrors
					}
				});
			}else{
				redis.test(request.data.host, request.data.port, request.data.pass, function (redisSuccess) {
					if(!redisSuccess){
						validationErrors['redis'] = "Unable to connect to Redis.";
						valid = false;
						console.log("REDIS "+ red + "BAD"+ white);
					}else{
						console.log("REDIS "+ green + "OK"+ white);
					}

					twitter.test(request.data.key, request.data.secret, request.data.callback_url, socket, function (twitterSuccess){
						if(!twitterSuccess){
							validationErrors['twitter'] = "Unable to connect to twitter.";
							valid = false;
							console.log("TWITTER "+ red + "BAD"+ white);
						}else{
							console.log("TWITTER "+ green + "OK"+ white);
						}

						if(valid){
							socket.emit("setConfig", {
								"id": request.id,
								"data": {
									"valid" : true
								}
							});
						}else{
							socket.emit("setConfig", {
								"id": request.id,
								"data": {
									"valid" : false,
									"validationErrors" : validationErrors
								}
							});
						}

					});
				});
}

}else{
	socket.emit("setConfig", {
		"id" : request.id,
		"err": {"id": 100, "text": "Already installed"}
	});	
}
});

});


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/
//						UTILS

function cloneObject(object) {
	var newObj = (object instanceof Array) ? [] : {};
	for (i in object) {
		if (object[i] && typeof object[i] == "object") {
			newObj[i] = cloneObject(object[i]);
		} else newObj[i] = object[i]
	} return newObj;
};

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

function isValid(data, keys){
	schem = cloneObject(dataSchem);
	for (i in keys) 
		if(schem.hasOwnProperty(keys[i]))
			schem = schem[keys[i]];	


		valid = true;

		if(schem.regex != undefined){
			regex = new RegExp(schem.regex);
			valid = valid && regex.test(data);
		}

		if(schem.dataType != undefined){
			switch(schem.dataType){
				case "int":
				if(!isNaN(parseInt(data))){
					if (schem.max != undefined)
						valid = valid && data <= schem.max;
					if (schem.min != undefined)
						valid = valid && data >= schem.min;
				}else{
					valid = false;
				}
				break;
				case "string":
				if(schem.max != undefined)
					valid = valid && data.toString.length <= max;
				if(schem.min != undefined)
					valid = valid && data.toString.length >= min;
				break;

			}
		}
		return valid;
	}