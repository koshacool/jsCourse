
var mapUsingLoops = function (func, thisArg) {
	if (typeof func !== 'function') { //Check type of argument 'func'
		throw new Error ('First argument isn\'t a function');
	}

   	thisArg = thisArg ? thisArg : this;//Check  context
   	var arr = [];
  
  	for (var i = 0; i < thisArg.length; i++) { //Call func to each array elements 
  		arr[arr.length] = func.call(thisArg, thisArg[i], i, thisArg);	
  	}
  
  	return arr;
};

var mapUsingRecursion = function (func, thisArg, arr) {
	arr = arr || [];//Set default value for new array
	if (typeof func !== 'function') { //Check type of argument 'func'
		throw new Error ('First argument isn\'t a function');
	}

   	thisArg = thisArg ? thisArg : this;//Check  context   	

   	//Call func to each array elements 
  	if (arr.length == thisArg.length) {
    	return arr; 
  	} else {
  		arr[arr.length] = func.call(thisArg, thisArg[arr.length], arr.length, thisArg);
    	return map(func, thisArg, arr);
  	} 	   
};