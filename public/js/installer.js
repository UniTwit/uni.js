var socket = io.connect();
var callbacks = {};
var popups = {};

var overlay;
var doneButton;

var isConfigured;

socket.on('connect', function () {
      console.log('Connected !');
});


window.onload = function(){
	document.getElementById('key').addEventListener('blur', validate);
	document.getElementById('secret').addEventListener('blur', validate);
	document.getElementById('port').addEventListener('blur', validate);
	document.getElementById('login').addEventListener('blur', validate);

	doneButton = document.getElementById('doneButton')
	doneButton.addEventListener('click', setConfig);

	document.getElementById('callback').innerHTML = window.location.href + "twitter/";
	
	overlay = document.getElementById('overlay');

	sendRequest('getState',{},function(response){
		console.log(response);
		if(response.twitter)
			document.getElementById('twitter').style.display = "none";
		if(response.redis)
			document.getElementById('redis').style.display = "none";
		if(response.account)
			document.getElementById('account').style.display = "none";
		isConfigured = response;
	});
}

function validate(e){

	console.log('Wait for validation...');

	switch(e.target.id){
		case "login":
			keys = ['username'];
		break;
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
	});
}

function setConfig(){
	doneButton.removeEventListener('click', setConfig);
	doneButton.classList.add('disabled');
	config = {};
	config.callback_url = window.location.href + "twitter/";

	if(!isConfigured.twitter)
		sendRequest('setTwitterConfig',
		{
			"key" : document.getElementById('key').value,
			"secret" : document.getElementById('secret').value,
			"callback_url" : window.location.href + "twitter/"
		},
		function(data){
			if(data.valid){
				isConfigured.twitter = true;
				document.getElementById('twitter').style.display = "none";
			}else{
				console.log(data);
			}
			updatePage();
		});

	if(!isConfigured.redis)
		sendRequest('setRedisConfig',
		{
			"host" : document.getElementById('host').value,
			"port" : document.getElementById('port').value,
			"pass" : document.getElementById('pass').value
		},
		function(data){
			if(data.valid){
				isConfigured.twitterRedis = true;
				document.getElementById('redis').style.display = "none";
			}else{
				console.log(data);
			}
			updatePage();
		});
}

function updatePage(){
	if(isConfigured.twitter && isConfigured.redis && isConfigured.account){
		// Reload page
	}else{
		doneButton.addEventListener('click', setConfig);
		doneButton.classList.remove('disabled');
	}
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

