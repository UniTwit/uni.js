var	dataSchem  = require('./dataSchem');
var fs = require('fs');

red   = '\033[31m';
blue  = '\033[34m';
green  = '\033[32m';
white = '\033[0m';
orange = '\033[33m';

var isReady = {
	"twitter" : false,
	"redis" : false,
	"accounts" : false,
	"app" : false
};

exports.isReady = function (){
	return isReady;
}

setReady = function(twitterOK, redisOK, accountIsPresent){

	if(twitterOK != isReady.twitter && twitterOK == true)
		console.log('TWITTER\t' + green + "OK" + white); 
	if(redisOK != isReady.redis && redisOK == true)
		console.log('REDIS\t' + green + "OK" + white); 
	if(accountIsPresent != isReady.accounts && accountIsPresent == true)
		console.log('ACCOUNT\t' + green + "OK" + white);
	if(redisOK && twitterOK && accountIsPresent != isReady.app && redisOK && twitterOK && accountIsPresent == true)
		console.log('INSTALL\t' + green + "OK" + white);  

	isReady = {
		"twitter" : twitterOK,
		"redis" : redisOK,
		"accounts" : accountIsPresent,
		"app" : redisOK && twitterOK && accountIsPresent
	};
}

exports.test = function (config, twitter, redis, accounts, callback){

	var redisOK = null;
	var twitterOK = null;
	var accountIsPresent = null;

	twitter.test(config.twitter.consumer_key, config.twitter.consumer_secret, config.twitter.callback_url, function(tOK){
		twitterOK = tOK;
		if(redisOK !== null && accountIsPresent !== null){
			setReady(twitterOK, redisOK, accountIsPresent);
			callback(twitterOK, redisOK, accountIsPresent);
		}
	});

	redis.test(config.redis.host, config.redis.port, config.redis.pass,function(rOK){

		redisOK = rOK;
		if(!rOK){
			accountIsPresent = false;

			if(twitterOK !== null){
				setReady(twitterOK, redisOK, accountIsPresent);
				callback(twitterOK, redisOK, accountIsPresent);
			}
		}else{
			accounts.link(redis);
			accounts.test(config.redis, function(aOK){
				accountIsPresent = aOK;

				if(twitterOK !== null){
					setReady(twitterOK, redisOK, accountIsPresent);
					callback(twitterOK, redisOK, accountIsPresent);
				}
			});

		}
	});
};

exports.setRedisConfig = function(data, redis, accounts, config, callback){
	var validationErrors = {};
	var valid = true;

	if(data.port != undefined){
		if(!isValid(data.port, ['port'])){
			validationErrors["port"] = "port has an invalid format.";
			valid = false;	
		}
	}else{
		validationErrors["port"] = "port not provided";
		valid = false;
	}

	if(data.host == ""){
		validationErrors["host"] = "host not provided";
		valid = false;
	}

	if(data.pass == ""){
		validationErrors["pass"] = "pass not provided";
		valid = false;
	}

	if(valid){
		redis.test(data.host, data.port, data.pass, function(redisSuccess){
			if(!redisSuccess){

				validationErrors['redis'] = "Unable to connect to redis.";
				valid = false;
			}
			setReady(isReady.twitter, valid, isReady.accounts);

			callback(valid, validationErrors);

			if(valid){

				config.redis = {
					"host" : data.host,
					"port" : data.port,
					"pass" : data.pass
				}

				accounts.link(redis);

				writeConfig(config);
			}
		});
	}else{
		setReady(isReady.twitter, valid, isReady.accounts);
		callback(valid, validationErrors);	
	}
}

exports.createFirstAccount = function(data, accounts, config, callback){
	var valid = true;
	var validationErrors = {};

	if(data.username != undefined){
		if(!isValid(data.username, ['username'])){
			validationErrors["username"] = "username has an invalid format.";
			valid = false;	
		}
	}else{
		validationErrors["username"] = "username not provided";
		valid = false;
	}

	if(data.password == ""){
		validationErrors["password"] = "password not provided";
		valid = false;		
	}

	if(data.confirmation == ""){
		validationErrors["confirmation"] = "confirmation not provided";
		valid = false;		
	}

	if(data.password != data.confirmation){
		validationErrors['passwords'] = "passwords don't match";
		valid = false;
	}

	if(!valid){
		setReady(isReady.twitter, isReady.redis, valid);
		callback(valid, validationErrors);
	}else{
		accounts.test(config.redis, function(thereIsAnAccount){
			if(thereIsAnAccount){
				validationErrors['accounts'] = "accounts already created";
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


exports.setTwitterConfig = function (data, twitter, config, callback){

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
		validationErrors["secret"] = "consumer_secret not provided";
		valid = false;
	}

	if(data.callback_url == ""){
		validationErrors["callback_url"] = "callback_url not provided";
		valid = false;		
	}

	if(!valid){
		setReady(valid, isReady.redis, isReady.accounts);
		callback(valid, validationErrors);
	}else{
		twitter.test(data.key, data.secret, data.callback_url, function (twitterSuccess){
			if(!twitterSuccess){
				validationErrors['twitter'] = "Unable to connect to twitter.";
				valid = false;
			}
			setReady(valid, isReady.redis, isReady.accounts);
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

writeConfig = function(config){
	config = JSON.stringify(config);
	fs.writeFile('config.json', config);
}

isValid = function (data, keys){
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

exports.isValid = isValid;

cloneObject = function(object) {
	var newObj = (object instanceof Array) ? [] : {};
	for (i in object) {
		if (object[i] && typeof object[i] == "object") {
			newObj[i] = cloneObject(object[i]);
		} else newObj[i] = object[i]
	} return newObj;
};