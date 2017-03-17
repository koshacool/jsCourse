function nextBigger(num) {
	if (!isFinite(num) || !num) {
		throw new Error ('It\'s not number');
	}

	var newNum = num;

	function findNearestMax() {
		var arr = String(num).split('');
		for (var i = arr.length - 2; i >= 0; i--) {
			for (var k = arr.length - 1; k > i; k--) {				
				if (arr[i] < arr[k]) {					
					var temp = arr[i];
					arr[i] = arr[k];
					arr[k] = temp;					
					return arr.concat(arr.splice(++i).sort((a,b) =>  a - b));					
				}
			}
		}
		return arr;
	}; 	

	function checkMaxNumber(a, b) {
		a == b ? console.log('It\'s already max number') : '';
	};

	if (String(num).length > 1) {
		newNum = findNearestMax().join('');		
	}

	checkMaxNumber(newNum, num);
	return newNum;
};