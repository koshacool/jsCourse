class App {
    constructor() {
        this._init()
    }

    _init() {
        document.addEventListener("DOMContentLoaded", () => router.run())
    }
};

class Router {
    constructor() {
        this._interval = null;
        this._oldLocation = {};
        this._routes = [];

        this._listen = this._listen.bind(this);
        this._handleRouteChange = this._handleRouteChange.bind(this);
        this.add = this.add.bind(this);
        this.run = this.run.bind(this);
    }

    get _location() {
        return window.location;
    }

    run() {
        this._listen();
    }

    _listen() {//Listen to change url, if change - change content
        clearInterval(this._interval);//Stop this interval

        this._interval = setInterval(() => {
            if (this._oldLocation.pathname !== this._location.pathname) {
                this._oldLocation = Object.assign({}, this._location);
                this._handleRouteChange(this._location);
            }
        }, 50);
    }

    _handleRouteChange(loc) {
        const findRoute = (pathname) => {
            return this._routes.find(route => {
                return typeof route.pathname === 'string'
                    ? pathname === route.pathname
                    : !!pathname.match(route.pathname);
            });
        }

        const route = findRoute(loc.pathname);

        if (route) {
            route.callback(loc);
        } else {
            findRoute('*').callback();
        }
    }

    add(pathname, callback) {
        this._routes.push({pathname, callback: callback.bind(null, this)});
        return this;
    }

    navigate(path, state = {}) {
        return history.pushState(state, null, path);
    }

    navigateBack() {
        history.back();
    }
};

function p(elementType, props = {}, childrens = null) {
    const element = document.createElement(elementType)
    const keys = Object.keys(props === null ? {} : props)

    if (keys.length) {
        keys.forEach(key => {
            switch (key) {
                case 'ref':
                    props.ref(element)
                    break
                case 'style':
                    typeof props[key] === 'string'
                        ? element[key] = props[key]
                        : Object.keys(props[key]).forEach(style => element.style[style] = props.style[style])
                    break
                default:
                    element[key] = props[key]
            }
        })
    }

    const append = item => typeof item === 'string'
        ? element.appendChild(document.createTextNode(item))
        : element.appendChild(item)

    if (childrens) {
        [].concat(childrens)
            .forEach(item => append(item))
    }

    return element
};

const store = {
    get(key) {
        return localStorage.getItem(key)
    },
    set(key, value) {
        return localStorage.setItem(key, value)
    }
};

class Model {
    defineModel(options) {
        this[options.name] = new Collection(options, this)
    }
};

class Collection {
    constructor(options, rootModel) {
        this._rootModel = rootModel
        this._name = options.name
        this._fields = options.fields
        this._data = {} //this._getInitialData()
    }

    // set _data(data) {
    //   this._data = data
    // }

    insert(data) {
        if (this._validateData(data)) {
            this._data[data.id] = data

            this._commit()
        } else {
            throw new Error({message: 'Bad data', data: data})
        }
    }

    find(value, key = 'id') {
        const element = this.findAll()
            .find(item => item[key] === value)

        return element
    }

    findAll() {
        const elements = Object.keys(this._data)
            .map(key => this._data[key])
        return elements
    }

    _getInitialData() {
        try {
            const initialData = store.get(this._name)
            return JSON.parse(initialData)
        } catch (e) {
            console.log(e.message)
        }
    }

    _validateData(data) {
        const dataKeys = Object.keys(data)

        const status = dataKeys.every(key => {
            // debugger
            const field = this._fields[key]
            if (!field) {
                return false
            }

            if (field.ref) {
                const refKey = '_' + field.ref
                data[refKey] = () => data[key].map(id => this._models[field.ref].find('id', id))
                return true
            }

            if (!(typeof data[key] === field.type)) {
                return false
            }

            if (field.presence && !data[key]) {
                return false
            }

            return true
        })

        return status
    }

    _commit() {
        try {
            store.set(this._name, JSON.stringify(this._data))
        } catch (e) {
            console.log('Commit error', this._data)
        }
    }
};

class BooksController {
    index(location) {
        const books = model.book.findAll()
        const view = renderBooksIndex(books)
        renderView(view)
    }

    show(_, location) {
        const id = location.pathname.split('/')[2]
        const book = model.book.find(id)
        const view = renderBooksShow(book)
        renderView(view)
    }
};

function renderView(view) {
    const root = document.getElementById('app')

    while (root.firstChild) {
        root.removeChild(root.firstChild)
    }

    root.appendChild(renderHeader())
    root.appendChild(view)
};

function renderBooksIndex(data) {
    const renderBook = book =>
        p('div', {className: 'book'}, [
            p('img', {src: book.image}),
            p('a', {
                href: '#', onclick(evt) {
                    evt.preventDefault();
                    router.navigate('/books/' + book.id)
                }
            }, book.title)
        ])

    return p('div', {className: 'books'}, data.map(renderBook))
};

function renderBooksShow(book) {
    return p('div', {className: 'book'}, [
        p('img', {src: book.image}),
        p('a', {
            href: '#', onclick(evt) {
                evt.preventDefault();
                router.navigate('/books/' + book.id)
            }
        }, book.title)
    ])
};

function renderNotFound(router) {
    const view =
        p('div', {id: 'hello'}, [
            p('div', {textContent: '404! Not Found!'}),
            p('a', {
                href: '#', textContent: 'Перейти на головну', onclick(evt) {
                    evt.preventDefault();
                    router.navigate('/')
                }
            }),
            p('a', {
                href: '#', textContent: 'Перейти назад', onclick(evt) {
                    evt.preventDefault();
                    router.navigateBack()
                }
            })
        ])

    return renderView(view)
};

function renderHeader() {
    return p('header', {id: 'header'}, [
        p('div', {className: 'title'},
            p('a', {
                href: '#', onclick(evt) {
                    evt.preventDefault();
                    router.navigate('/')
                }
            }, 'Death poets\' community')
        ),
        p('div', {className: 'links'}, [
            p('a', {
                href: '#', onclick(evt) {
                    evt.preventDefault();
                    router.navigate('/books')
                }
            }, 'Books'),
            ' ',
            p('a', {
                href: '#', onclick(evt) {
                    evt.preventDefault();
                    router.navigate('/authors')
                }
            }, 'Authors')
        ])
    ])
};

function renderRoot(router) {
    const view =
        p('div', {id: 'header'}, [
            p('div', {textContent: 'Привіт, TernopilJS!'}),
            p('div', {textContent: ' Базовий приклад SPA без використання сторонніх бібліотек.'}),
            p('a', {
                href: '#', textContent: 'Перейти на привітання', onclick(evt) {
                    evt.preventDefault();
                    router.navigate('/hello')
                }
            }),
            p('a', {
                href: '#', textContent: 'Перейти назад', onclick(evt) {
                    evt.preventDefault();
                    router.navigateBack()
                }
            })
        ])

    return renderView(view)
};

const router = new Router();
const model = new Model();
const app = new App();
const booksController = new BooksController();

router
    .add('/', renderRoot)
    .add('/books', booksController.index)
    .add(/(\/books\/)(\d+)/, booksController.show)
    // .add('/authors', authorsController.index)
    // .add('/(\/authors\/)(\d+)/', authorsController.show)
    .add('*', renderNotFound);

model.defineModel({
    name: 'author',
    fields: {
        id: {type: 'string'},
        fullName: {type: 'string', defaultTo: '', presence: true},
        avatarUrl: {type: 'string', defaultTo: 'http://placehold.it/100x300'},
        dateOfDeath: {type: 'string', defaultTo: ''},
        city: {type: 'string', defaultTo: ''},
        books: {ref: 'book'}
    }
});

model.defineModel({
    name: 'book',
    fields: {
        id: {type: 'string'},
        title: {type: 'string', defaultTo: ''},
        image: {type: 'string', defaultTo: 'http://placehold.it/100x300'},
        genre: {type: 'string', defaultTo: ''},
        year: {type: 'string', defaultTo: ''},
        authors: {ref: 'author'}
    }
});

model.author.insert({
    id: '1',
    fullName: 'Death Man',
    avatarUrl: '',
    dateOfDeath: '',
    city: '',
    books: ['1']
});

model.book.insert({
    id: '1',
    title: 'Book of Death Man',
    image: 'http://placehold.it/150x300',
    genre: 'Novel',
    year: '2000',
    authors: ['1']
});

model.book.insert({
    id: '2',
    title: 'Book of Second Death Man',
    image: 'http://placehold.it/150x300',
    genre: 'Novel',
    year: '2001',
    authors: ['2']
});