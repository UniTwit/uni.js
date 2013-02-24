
var redis;

exports.link = function(redisDB){
	redis = redisDB;
}

exports.test = function(cred, callback){
	redis.connect(cred.host, cred.port, cred.pass, function(){
		redis.getAccounts(function(accounts) {
			if(accounts.length == 0){
				callback(false);
			}else{
				callback(true);
			}
		})
	});
}

exports.create = function(username, password, callback){
	redis.createAccount(username, {"hash" : password }, function(){ // BADDDDD Bouhhh !!! *purpose testing only*
		callback();
	});
}