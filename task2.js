function MyObject() {

	this.property = function(name, value) {
		Object.defineProperty(this, name, { 
			value: value,
			configurable: true, 
			writable: true, 
			enumerable: true  
		});
	 };

	this.constant = function(name, value) {
		Object.defineProperty(this, name, { 
			value: value,
			writable: false, 
			configurable: false,  
		});
	 };

	this.hidden = function(value) {
		Object.defineProperty(this, name, { 
			enumerable: false,
		});
	};

	this.values = function() {
		var props = [];
		for (var prop in this) {
  			props.push(this[prop]);
		}
		return props;
	};	
	Object.defineProperty(this, "property", {enumerable: false});
	Object.defineProperty(this, "constant", {enumerable: false});
	Object.defineProperty(this, "hidden", {enumerable: false});
	Object.defineProperty(this, "values", {enumerable: false});
};

