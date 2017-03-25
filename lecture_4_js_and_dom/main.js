class App {
  	constructor() {
		this.router = new Router()

		this.router
	  		.add('/', renderRoot)
	  		.add('/hello', renderHello)
	  		.add('*', renderNotFound)

		this._init()
  	}

  	_init() {
		document.addEventListener("DOMContentLoaded", () => this.router.run());
  	}
}

class Router {
	constructor() {
		this.routes = {};
		this.history = window.History.createBrowserHistory();
	}

	add(path, func) {
		this.routes[path] = func;
		return this;
	}

	run() {
		this.navigate(this.history.location.pathname);		
		this.listenLinks();		
	}

	listenLinks() {
		var links = document.getElementsByTagName('a');		
		for (var i = 0; i < links.length; i++) {
			if (links[i].id == 'back') {
				links[i].addEventListener("click", (event) => {
					event.preventDefault();						
					this.history.goBack();
					this.navigate(window.location.pathname);	
				});
			} else {
				links[i].addEventListener("click", (event) => {
					event.preventDefault();
					this.navigate(event.currentTarget.pathname);	
					this.history.push(event.currentTarget.pathname);
				});
			}						
		}			
	}

	navigate(url) {
		var view;
		if (this.routes[url]) {
			view = (this.routes[url])(this.createDOMElement);
		} else {
			view = (this.routes['*'])(this.createDOMElement);
		}
		var app = document.getElementById('app');
		app.innerHTML = '';
		app.appendChild(view);
		this.listenLinks();
	}

	createDOMElement(name, attributes = null, children = null) {

		//Concatination object params for style atributes
		function concatStyle(obj) {
			var params = '';
			for (var key in obj) {
				params += key + ': ' + obj[key] + ';';
			}
			return params;
		};
		var elem = document.createElement(name);//Create element

		if (attributes) {//Sets attributes for this element
			for (var key in attributes) {						
				(attributes[key] instanceof Object) ?	
					elem[key] = concatStyle(attributes[key])//If value is object - concatination it
					: 
					elem[key] = attributes[key];
			}
		}

		if (children) { //Add child elements to this element
			if (Array.isArray(children)) {	
				children.forEach((item) => {
					(typeof item === 'string') ?
						elem.appendChild(document.createTextNode(item))
						:
						elem.appendChild(item);
				});
			} else {
				elem.textContent = children;
			}		
		}

		return elem;
	};
}

function renderRoot(p) {
	var view = p(
		'div', 
		{id: 'header', style: {width: '300px', margin: '40px auto'},}, 
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
				'Це головна сторінка'
			),
			p('br'),
			p(
				'a', 
				{href: '/hello'}, 
				'Перейти на привітання'
			),
			' ',
			p(
				'a', 
				{href: '#', id: 'back'}, 
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
	return view;	
}

function renderHello(p) {
	var view = p(
		'div', 
		{id: 'header', style: {width: '300px', margin: '40px auto'}}, 
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
				{href: '/'}, 
				'Перейти на головну'
			),
			' ',
			p(
				'a', 
				{href: '#', id: 'back'}, 
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
	return view;
}

function renderNotFound(p) {
	var view = p(
		'div', 
		{id: 'header', style: {width: '300px', margin: '40px auto'}}, 
		[
			p(
				'div', 
				{style: 'font-size: 2rem;'},
				'Page not found.'
			),
			p('br'),
			p(
				'a', 
				{href: '/'}, 
				'На головну'
			),
			' ',
			p(
				'a', 
				{href: '#', id: 'back'}, 
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
	return view;
}

const app = new App();