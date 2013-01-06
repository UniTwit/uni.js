var socket = io.connect();
var callbacks = {};
var popups = {};

var overlay;
var doneButton;

socket.on('connect', function () {
      console.log('Connected !');
});

socket.on('openTwitterAuthPage', function (data) {
	console.log('TWUT !\t\t\t'+ data.request_token);
	overlay.classList.add('block');
	popups['twitterAuthPage'] = window.open("https://twitter.com/oauth/authenticate?oauth_token=" + data.request_token, '_newtab');
});

socket.on('closeTwitterAuthPage', function (data) {
	popups['twitterAuthPage'].close();
});


window.onload = function(){
	document.getElementById('key').addEventListener('blur', validate);
	document.getElementById('secret').addEventListener('blur', validate);
	document.getElementById('port').addEventListener('blur', validate);

	doneButton = document.getElementById('doneButton')
	doneButton.addEventListener('click', setConfig);

	document.getElementById('callback').innerHTML = window.location.origin + "/twitter";
	
	overlay = document.getElementById('overlay');

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

	doneButton.removeEventListener('click', setConfig);
	doneButton.classList.add('disabled');
	config = {};
	config.callback_url = window.location.origin + "/twitter";
	inputs = document.getElementsByTagName('input');

	for(i in inputs)
		config[inputs[i].id] = inputs[i].value;


	sendRequest('setConfig', config, function(response){
		overlay.classList.remove('block');
		doneButton.classList.remove('disabled');
		if(!response.valid){
			console.log('INVALID !');
			console.log(response.validationErrors);
			doneButton.removeEventListener('click', setConfig);
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

