var view = p(
	'div', 
	{id: 'header'}, 
	[
		p(
			'div', 
			{style: 'font-size: 2rem;'}, 
			'Привіт, TernopilJS!'
		),
		p('br'),
		p(
			'div', 
			null, 
			'Базовий приклад SPA без використання сторонніх бібліотек.'
		),
		p('br'),
		p(
			'a', 
			{href: '#', onclick(evt) {evt.preventDefault(); router.navigate('/hello')}}, 
			'Перейти на привітання'
		),
		' ',
		p(
			'a', 
			{href: '#', onclick(evt) {evt.preventDefault(); router.navigateBack()}}, 
			[
				'Перейти ',
				p(
				 	'span', 
					{style: {color: 'red'}}, 
					'назад'
				)
			]
		)
	]
);

//Concatination object params for style atributes
function concatStyle(obj) {
	var params = '';
	for (var key in obj) {
		params += key + ': ' + obj[key] + ';';
	}
	return params;
};



function p(name, attributes = null, children = null) {
	var elem = document.createElement(name);//Create element

	if (attributes) {//Sets attributes for this element
		for (var key in attributes) {//If value is object - concatination it			
			(attributes[key] instanceof Object) 
			?	
				elem[key] = concatStyle(attributes[key]) 
			: 
				elem[key] = attributes[key];
		}
	}

	if (children) {//Add elements to this element
		if (Array.isArray(children)) {
			if (typeof children[0] === 'string') {
					elem.textContent = children.shift();
			}

			children.forEach((item, i) => {
				if (typeof item === 'string') {
					return;
				}
				elem.appendChild(item);
			});
		} else {
			elem.textContent = children;
		}		
	}

	return elem;
};

document.getElementById('albums').appendChild(view);