/*
	uni.js

App entry point.

*/

// modules
var fs = require('fs');
var Twit = require('twit');
var http = require('http');

// config file
var config = require('./config');
// mime-type
var mimetypes  = require('./mime-type')

// start websockets
//var io = require('socket.io').listen(config.io_port);

// start http server
http.createServer(onRequest).listen(config.http_port);

var installed = config.twitter.consumer_key !== null && config.twitter.consumer_key !== null;


function onRequest(req, res){

	// grab first element in the url to know what to do.

	request = req.url.split('/');
	switch(request[1]){
		case "skin":
			// replace 'skin' in the url by the real path of th selected skin, and continue like other static files
			request[1] = "skins/" + config.skin;
		case "js":
		case "img":
			sendFile(request.join('/'));
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

