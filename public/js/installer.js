var socket = io.connect();
var popups = {};

var overlay;
var doneButton;

var isConfigured;
var isSeen  = {"twitter":false,"redis":false,"account":false};
var callbacks = {};

socket.on('connect', function () {
	console.log('Connected !');
	initEvents();
	updatePage();
});



function initEvents(){
	document.getElementById('key').addEventListener('blur', validate);
	document.getElementById('secret').addEventListener('blur', validate);
	document.getElementById('port').addEventListener('blur', validate);
	document.getElementById('login').addEventListener('blur', validate);

	document.getElementById('callback').innerHTML = window.location.href + "twitter/";

	document.getElementById('set_twitter').addEventListener('click', setConfig);
	document.getElementById('set_redis').addEventListener('click', setConfig);
	document.getElementById('set_account').addEventListener('click', setConfig);

	document.getElementById('yeah').addEventListener('click', function(){
		window.location.reload(false); 
	});
	
	overlay = document.getElementById('overlay');
}

function validate(e){

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
	hideForm(currentForm);
	config = {};
	config.callback_url = window.location.href + "twitter/";

	if(currentForm == "twitter"){
		sendRequest('setTwitterConfig',
		{
			"key" : document.getElementById('key').value,
			"secret" : document.getElementById('secret').value,
			"callback_url" : window.location.href + "twitter/"
		},
		function(data){
			if(data.valid){
				isConfigured.twitter = true;
			}else{
				console.log(data);
			}
			updatePage();
		});

	}else if(currentForm == "redis"){
		sendRequest('setRedisConfig',
		{
			"host" : document.getElementById('host').value,
			"port" : document.getElementById('port').value,
			"pass" : document.getElementById('pass').value
		},
		function(data){
			if(data.valid){
				isConfigured.redis = true;
			}else{
				console.log(data);
			}
			updatePage();
		});

	}else if(currentForm == "account"){
		sendRequest('createFirstAccount',
		{
			"username" : document.getElementById('login').value,
			"password" : document.getElementById('password').value,
			"confirmation" : document.getElementById('confirm').value
		},
		function(data){
			console.log('Receiving "createFirstAccount"...')
			if(data.valid){
				isConfigured.account = true;
			}else{
				console.log(data);
			}
			updatePage();
		});
	}
}

function updatePage(){
	currentForm = "installed"
	sendRequest('getState',{},function(response){
		if(response.twitter){
			setIndic('twitter', 'valid');
		}else{
			if(!isSeen.twitter)
				setIndic('twitter', 'unconfigured');
			else
				setIndic('twitter', 'invalid');
			currentForm = "twitter";
		}

		if(response.redis){
			setIndic('redis', 'valid');
			if(response.account){
				setIndic('account', 'valid');
			}else{
				if(!isSeen.account)
					setIndic('account', 'unconfigured');
				else
					setIndic('account', 'invalid');
				currentForm = "account";
			}
		}else{
			if(!isSeen.redis)
				setIndic('redis', 'unconfigured');
			else
				setIndic('redis', 'invalid');
			currentForm = "redis";
		}
		isConfigured = response;
		setupForm(currentForm);
	});
}


function setIndic(id, state){
	indic = document.getElementById('indic_'+id);
	indic.classList.remove('unconfigured');
	indic.classList.remove('valid');
	indic.classList.remove('invalid');
	indic.classList.remove('loading');
	indic.classList.add(state);
}

function setupForm(id){
	document.getElementById(id).classList.add('visible');
	isSeen[id] = true;
}
function hideForm(id){

	document.getElementById(id).classList.remove('visible');
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

