// installer.js

var fs = require('fs');
var colors = require('colors2');

var isReady = {
	"twitter" : false,
	"redis" : false,
	"account" : false,
	"app" : false
};

var config = null;
var twitter = null;
var redis = null;
var accounts = null;

var onReady = null;

exports.setup = function(c, t, r, a){
	config = c;
	twitter = t;
	redis = r;
	accounts = a;
}

exports.onReady = function(callback){
	onReady = callback;
}

exports.isReady = function (){
	return isReady;
}

exports.getActions = function(addAction){
	addAction("createFirstAccount", onCreateFirstAccount);
	addAction("getState", onGetState);
	addAction("setTwitterConfig", onSetTwitterConfig);
	addAction("setRedisConfig", onSetRedisConfig);
}


// webSocket calls

onGetState = function(request, callback){
	err = null;
	data = isReady;
	callback(err, data);
}

onSetTwitterConfig = function(request, callback){
	if(isReady.twitter){
		err = {"id": 101, "text": "Twitter is already configured."};
		data = null;
		callback(err, data);
	}else{
		setTwitterConfig(request.data, function(valid, validationErrors){
			err = null;
			data = {"valid": valid,"validationErrors" : validationErrors};
			callback(err, data);
		});
	}
}

onSetRedisConfig = function(request, callback){
	if(isReady.redis){
		err = {"id": 102, "text": "Redis is already configured."}
		data = null;
		callback(err, data);
	}else{
		setRedisConfig(request.data, function(valid, validationErrors){
			err = null;
			data = {"valid": valid,"validationErrors" : validationErrors};
			callback(err, data);
		});
	}
}

onCreateFirstAccount = function(request, callback){
	if(!isReady.redis){
		err = {"id": 104, "text": "You must configure Redis before create the first account."}
		data = null;
		callback(err, data);
	}else if(isReady.account){
		err = {"id": 103, "text": "First account already created."}
		data = null;
		callback(err, data);
	}else{
		createFirstAccount(request.data, function(valid, validationErrors){
			err = null;
			data = {"valid": valid,"validationErrors" : validationErrors};
			callback(err, data);
		});
	}
}

setRedisConfig = function(data, callback){
	var validationErrors = {};
	var valid = true;

	if(data.port != undefined){
		if(!isValid(data.port, ['port'])){
			validationErrors["port"] = "Port has an invalid format.";
			valid = false;	
		}
	}else{
		validationErrors["port"] = "Port not provided.";
		valid = false;
	}

	if(data.host == ""){
		validationErrors["host"] = "Host not provided.";
		valid = false;
	}

	if(data.pass == ""){
		validationErrors["pass"] = "Securecode not provided.";
		valid = false;
	}

	if(valid){
		redis.test(data.host, data.port, data.pass, function(redisSuccess){
			if(!redisSuccess){
				validationErrors['redis'] = "Unable to connect to redis.";
				valid = false;
			}
			setReady(isReady.twitter, valid, isReady.account);

			if(valid){

				config.redis = {
					"host" : data.host,
					"port" : data.port,
					"pass" : data.pass
				}

				accounts.link(redis);
				writeConfig(config);

				checkInstall(function(){
					callback(valid, validationErrors);
				});
			}else{
				callback(valid, validationErrors);	
			}

		});
	}else{
		setReady(isReady.twitter, valid, isReady.account);
		callback(valid, validationErrors);	
	}
}

createFirstAccount = function(data, callback){
	var valid = true;
	var validationErrors = {};

	if(data.username != undefined){
		if(!isValid(data.username, ['username'])){
			validationErrors["username"] = "Username has an invalid format.";
			valid = false;	
		}
	}else{
		validationErrors["username"] = "Username not provided.";
		valid = false;
	}

	if(data.password == ""){
		validationErrors["password"] = "Password not provided.";
		valid = false;		
	}

	if(data.confirmation == ""){
		validationErrors["confirmation"] = "Confirmation not provided.";
		valid = false;		
	}

	if(data.password != data.confirmation){
		validationErrors['passwords'] = "Passwords don't match.";
		valid = false;
	}

	if(!valid){
		setReady(isReady.twitter, isReady.redis, valid);
		callback(valid, validationErrors);
	}else{
		accounts.test(config.redis, function(thereIsAnAccount){
			if(thereIsAnAccount){
				validationErrors['account'] = "Account already created.";
				valid = false;
			}	
			setReady(isReady.twitter, isReady.redis, thereIsAnAccount);
			callback(valid, validationErrors);

			if(valid){
				accounts.create(data.username, data.password, function(){
					setReady(isReady.twitter, isReady.redis, true);
					callback(valid, validationErrors);
				});
			}
		});
	}

}

setTwitterConfig = function (data, callback){

	var validationErrors = {};
	var valid = true;

	if(data.key != undefined){
		if(!isValid(data.key, ['twitter','consumer_key'])){
			validationErrors["key"] = "consumer_key has an invalid format.";
			valid = false;	
		}
	}else{
		validationErrors["key"] = "consumer_key not provided";
		valid = false;
	}

	if(data.secret != undefined){
		if(!isValid(data.secret, ['twitter','consumer_secret'])){
			validationErrors["secret"] = "consumer_secret has an invalid format.";
			valid = false;	
		}
	}else{
		validationErrors["secret"] = "consumer_secret not provided.";
		valid = false;
	}

	if(data.callback_url == ""){
		validationErrors["callback_url"] = "callback_url not provided.";
		valid = false;		
	}

	if(!valid){
		setReady(valid, isReady.redis, isReady.account);
		callback(valid, validationErrors);
	}else{
		twitter.test(data.key, data.secret, data.callback_url, function (twitterSuccess){
			if(!twitterSuccess){
				validationErrors['twitter'] = "Unable to connect to twitter.";
				valid = false;
			}
			setReady(valid, isReady.redis, isReady.account);
			callback(valid, validationErrors);

			if(valid){
				config.twitter = {
					"consumer_key" : data.key,
					"consumer_secret" : data.secret,
					"callback_url" : data.callback_url
				}
				writeConfig(config);
			}

		});

	}
}


setReady = function(twitterOK, redisOK, accountIsPresent){

	if(twitterOK != isReady.twitter && twitterOK == true)
		console.log('TWITTER\t' + "OK".green); 
	if(redisOK != isReady.redis && redisOK == true)
		console.log('REDIS\t' + "OK".green); 
	if(accountIsPresent != isReady.account && accountIsPresent == true)
		console.log('ACCOUNT\t' + "OK".green);
	if(redisOK && twitterOK && accountIsPresent != isReady.app && redisOK && twitterOK && accountIsPresent == true){
		console.log('INSTALL\t' + "OK".green);
		if(onReady !== null)
			onReady();
	}  

	isReady = {
		"twitter" : twitterOK,
		"redis" : redisOK,
		"account" : accountIsPresent,
		"app" : redisOK && twitterOK && accountIsPresent
	};
}

checkInstall = function (callback){

	var redisOK = null;
	var twitterOK = null;
	var accountIsPresent = null;

	twitter.test(config.twitter.consumer_key, config.twitter.consumer_secret, config.twitter.callback_url, function(tOK){

		twitterOK = tOK;

		redis.test(config.redis.host, config.redis.port, config.redis.pass,function(rOK){

			redisOK = rOK;
			if(rOK === false){

				accountIsPresent = false;
				setReady(twitterOK, redisOK, accountIsPresent);
				callback(twitterOK, redisOK, accountIsPresent);
			}else{

				accounts.link(redis);
				accounts.test(config.redis, function(aOK){
					accountIsPresent = aOK;
					setReady(twitterOK, redisOK, accountIsPresent);
					callback(twitterOK, redisOK, accountIsPresent);
				});
			}
		});
	});
};

exports.test = checkInstall;


writeConfig = function(config){
	config = JSON.stringify(config);
	fs.writeFile('config.json', config);
}