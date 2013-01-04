var socket = io.connect('http://ks.multoo.eu:1337');
var callbacks = {};

socket.on('connect', function () {
      console.log('Connected !');
});


window.onload = function(){
	document.getElementById('key').addEventListener('blur', validate);
	document.getElementById('secret').addEventListener('blur', validate);
	document.getElementById('access').addEventListener('blur', validate);
	document.getElementById('s_access').addEventListener('blur', validate);
	document.getElementById('port').addEventListener('blur', validate);

	document.getElementById('doneButton').addEventListener('click', setConfig);

	sendRequest('getConfig',{},function(response){
		for(key in response)
			if(response[key] !== null)
				document.getElementById(key).value = response[key];
	})
}

function validate(e){

	console.log('Wait for validation...');

	switch(e.target.id){
		case "key":
			keys = ['twitter', 'consumer_key'];
		break;
		case "secret":
			keys = ['twitter','consumer_secret'];
		break;
		case "access":
			keys = ['twitter', 'access_token'];
		break;
		case "s_access":
			keys = ['twitter','access_token_secret'];
		break;
		case "port":
			keys = ['port'];
		break;
	}

	sendRequest('dataValidation', {"value" : e.target.value, "keys" : keys}, function(response){
		console.log(response.valid);
		if(response.valid){
			e.target.classList.add('valid');
			e.target.classList.remove('invalid');
		}else{
			e.target.classList.remove('valid');
			e.target.classList.add('invalid');
		}
	})
}

function setConfig(){

	config = {};
	inputs = document.getElementsByTagName('input');

	for(i in inputs)
		config[inputs[i].id] = inputs[i].value;


	sendRequest('setConfig', config, function(response){
		if(!response.valid){
			console.log('INVALID !');
			console.log(response.validationErrors)
		}else{
			console.log('VALID !');
		}
	})
}

function sendRequest(name, data, callback){
	id = Math.random().toString(36).substring(7);

	callbacks[id] = callback;

	socket.on(name, function (response) {
		if(callbacks[response.id] !== null)
			if(response.err){
				console.log("ERROR No " + response.err.id +" : " + response.err.text);
			}else{
      			callbacks[response.id](response.data);
      		}
      	callbacks[response.id] = null;
	});

	socket.emit(name, {"id" : id, "data" : data});
}

