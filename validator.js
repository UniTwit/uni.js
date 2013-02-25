// validator.js

var	dataSchem  = require('./dataSchem');

exports.getActions = function(addAction){
	addAction("dataValidation", onDataValidationRequest);
}

onDataValidationRequest = function(request, callback){
	err = null;
	data = {"valid" : isValid(request.data.value, request.data.keys)}
	callback(err,data);
}

isValid = function (data, keys){
	schem = cloneObject(dataSchem);
	for (i in keys){ 
		if(schem.hasOwnProperty(keys[i])){
			schem = schem[keys[i]];	
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
	}
}

exports.isValid = isValid;
