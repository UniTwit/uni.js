// websocket.js

var modules = [];

var io = null;

exports.link = function(http_server){
	io = require('socket.io').listen(http_server);
	io.set('log level', 1);
	io.sockets.on('connection', onClient);
}

exports.linkModules = function(m){
	modules = m;
}

onClient = function(socket) {
	for(mod in modules){
		modules[mod].getActions(function(name, action){
			socket.on(name,function(request){
				action(request, function (err, data) {
					socket.emit(name,{
						"id" : request.id,
						"data" : data,
						"err" : err	
					});
				});
			});
		});
	}
}