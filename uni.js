/*
	uni.js

App entry point.

*/

var red, blue, reset;
red   = '\033[31m';
blue  = '\033[34m';
green  = '\033[32m';
reset = '\033[0m';

console.log(red + "UNI" + green + "\nv0.1");

// modules
var fs = require('fs');
var Twit = require('twit');
var http = require('http');

// config file
var config = require('./config');
// mime-type
var mimetypes  = require('./mime-type')

// start http/io server
http_server = http.createServer(onRequest)
var io = require('socket.io').listen(http_server);
http_server.listen(config.http_port);
console.log("HTTP server "+ green + "started" + reset + " at port " + blue + config.http_port + reset);

// determine if UNI is correctly installed
var installed = config.twitter.consumer_key !== null && config.twitter.consumer_key !== null;
if(installed)
	console.log('Installed: '+blue+"yes"+reset);
else
	console.log('Installed: '+red+"no"+reset);

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

// TODO


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

