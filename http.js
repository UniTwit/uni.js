// http.js

var http = require('http');
var fs = require('fs');
var mimetypes = require('./mime-type');

var server = null;
var config = null;

var installerEnabled = true;

exports.create = function(conf, callback){
	config = conf;
	server = http.createServer(onRequest);
	callback(server);
}

exports.listen  = function(callback){
	server.listen(config.http_port);
	callback();
}

exports.disableInstaller = function(){
	installerEnabled = false;
}

onRequest = function(req, res){
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
			if (installerEnabled) {
				sendFile('/pages/install.html',res);
			}else{
				sendFile('/pages/app.html',res);
			}
		break;
	}	
}

sendFile = function(path, res){
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