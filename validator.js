// validator.js

var	dataSchem  = require('./dataSchem');

// link with wobsocket
exports.getActions = function(addAction){
	addAction("dataValidation", onDataValidationRequest);
}

onDataValidationRequest = function(request, callback){
	err = null;
	data = {"valid" : isValid(request.data.value, request.data.keys)}
	callback(err,data);
}

isValid = function (data, keys){
	var schem = cloneObject(dataSchem);
	var i = 0;

	if(keys.length < 5){

		while(schem.hasOwnProperty(keys[i])){
			schem = schem[keys[i]];
			i++;
		}
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
	}else{
		return false;
	}
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
