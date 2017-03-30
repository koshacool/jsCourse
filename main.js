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
    const element = document.createElement(elementType);
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
        return localStorage.getItem(key);
    },
    set(key, value) {
        return localStorage.setItem(key, value);
    },
    remove(key) {
        return localStorage.removeItem(key);
    }
};

class Model {
    defineModel(options) {
        this[options.name] = new Collection(options, this);
    }
};

class Collection {
    constructor(options, rootModel) {
        this._rootModel = rootModel
        this._name = options.name
        this._fields = options.fields
        this._data = {} //this._getInitialData()
    }

    insert(data) {
        const validData = this._validateData(data);

        if (validData) {
            this._data[data.id] = validData;
            this._commit();//Save data in localStorage
        } else {
            throw new Error({message: 'Bad data', data: data});
        }
    }

    remove(id) {
        try {
            store.remove(id);
            delete this._data[id];
        } catch (e) {
            console.log(e.message + 'Error: Can\'t remove data');
        }
    }

    find(id, key = 'id') {
        const element = this.findAll()
            .find(item => item[key] == id);

        return element;
    }

    findAll() {
        const elements = Object.keys(this._data)
            .map(key => this._data[key]);
        return elements;
    }

    _getInitialData() {
        try {
            const initialData = store.get(this._name);
            return JSON.parse(initialData);
        } catch (e) {
            console.log(e.message);
        }
    }

    _validateData(data) {
        const validation = {
            ref: (dataKey, value, param) => {
                const refKey = '_' + param;
                data[refKey] =  () => {
                    return data[dataKey].map(id => this._rootModel[param].find(id, 'id'));
                }
                return true;
            },
            type: (dataKey, value, param) => {return (typeof value === param)},
            defaultTo: (dataKey, value, param) => {
                //console.log(dataKey + ':' + value + ':' + param);
                if(!value) {
                    data[dataKey] = this._fields[dataKey].defaultTo;
                }
                return true;
            },
            required: (dataKey, value, param) => {
                if (param && !value) {
                    return false;
                }
                return true;
            },
        };

        const dataKeys = Object.keys(data);

        dataKeys.every((key) => {//if all data's fields don't exist in the model - show Error
            if (!this._fields[key]) {
                throw new Error('This field "' + key + '" is not available');
            }
        });

        const validationKeys = Object.keys(this._fields);//Get fields name for validation
        const status = validationKeys.every((key) => {
            let objectParams = this._fields[key];//Validation params for each field

            if(objectParams.defaultTo) { //If isset default value for this field - check it
                (validation.defaultTo)(key, data[key], objectParams[param]);
            }

            if (!data[key]) {//If user don't give such field and don't exist default value - show Error
                return false;
            }

            for (var param in objectParams) {//Validate field
                var result = (validation[param])(key, data[key] ,objectParams[param]);
                if (!result) {
                    return false;
                }
            }

            return true;
        });

        return status ? data : false;
    }

    _commit() {
        try {
            store.set(this._name, JSON.stringify(this._data));
        } catch (e) {
            console.log('Commit error', this._data);
        }
    }
};

class BooksController {
    index(location) {
        const books = model.book.findAll();
        renderView(createRenderData(renderBooksIndex, books));
    }

    show(_, location) {
        const id = location.pathname.split('/')[2];
        const book = model.book.find(id);
        renderView(createRenderData(renderBooksShow, book));
    }

    showAuthors(_, location) {
        const id = location.pathname.split('/')[2];
        const book = model.book.find(id);
        const authors = book ? book._author() : null;
        console.log(authors)
        renderView(createRenderData(renderAuthorsIndex, authors));
    }
};

class AuthorsController {
    index(location) {
        const authors = model.author.findAll();
        renderView(createRenderData(renderAuthorsIndex, authors));
    }

    show(_, location) {
        const id = location.pathname.split('/')[2];
        const author = model.author.find(id);
        renderView(createRenderData(renderAuthorsShow, author));
    }

    showBooks(_, location) {
        const id = location.pathname.split('/')[2];
        const author = model.author.find(id);
        const books = author ? author._book() : null;
        renderView(createRenderData(renderBooksIndex, books));
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

function createRenderData(funcName, data) {
    let view = '';

    if (data) {
        view = (funcName)(data);
    } else {
        view =
            p('div', {id: 'hello'}, [
                    p('div', {textContent: 'Data not found'}),
                ]
            );
    }

    return view;
};


function renderBooksIndex(data) {
    const renderBook = book =>
        p('div', {className: 'book'}, [
            p('div', {className: 'book'}, [
                p('br'),
                p('img', {src: book.image}),
                p('a', {
                    href: '/books/' + book.id, onclick(evt) {
                        evt.preventDefault();
                        router.navigate(evt.currentTarget.pathname)
                    }
                }, book.title),
            ]
            )]);

    return p('div', {className: 'books'}, [
        p('a', {
            href: '#', onclick(evt) {
                evt.preventDefault();
                //addBook();
            }
        }, 'Add new book'),
        p('div', {className: 'books'}, data.map(renderBook))
    ]);
};

function renderBooksShow(book) {
    return p('div', {className: 'book'}, [
        p('img', {src: book.image}),
        p('a', {
            href: '/books/' + book.id, onclick(evt) {
                evt.preventDefault();
                router.navigate(evt.currentTarget.pathname);
            }
        }, book.title),
        p('br'),
        p('a', {
            href: '/books/' + book.id + '/authors', onclick(evt) {
                evt.preventDefault();
                router.navigate(evt.currentTarget.pathname);
            }
        }, 'Authors'),
    ])
};

function renderAuthorsIndex(data) {
    const renderBook = author => {
        if (author) {
            return p('div', {className: 'author'}, [
                p('img', {src: author.avatarUrl}),
                p('a', {
                    href: '/authors/' + author.id, onclick(evt) {
                        evt.preventDefault();
                        router.navigate(evt.currentTarget.pathname)
                    }
                }, author.fullName)
            ])
        } else {
            return p('br')
        }
    }

    return p('div', {className: 'authors'}, data.map(renderBook))
};

function renderAuthorsShow(author) {
    return p('div', {className: 'author'}, [
        p('img', {src: author.avatarUrl}),
        p('a', {
            href: '/authors/' + author.id, onclick(evt) {
                evt.preventDefault();
                router.navigate(evt.currentTarget.pathname)
            }
        }, author.fullName),
        p('br'),
        p('a', {
            href: '/authors/' + author.id + '/books', onclick(evt) {
                evt.preventDefault();
                router.navigate(evt.currentTarget.pathname);
            }
        }, 'Books'),
    ])
};

function renderNotFound(router) {
    const view =
        p('div', {id: 'hello'}, [
            p('div', {textContent: '404! Not Found!'}),
            p('a', {
                href: '/', textContent: 'Перейти на головну', onclick(evt) {
                    evt.preventDefault();
                    router.navigate(evt.currentTarget.pathname)
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
                href: '/', onclick(evt) {
                    evt.preventDefault();
                    router.navigate(evt.currentTarget.pathname)
                }
            }, 'Death poets\' community')
        ),
        p('div', {className: 'links'}, [
            p('a', {
                href: '/books', onclick(evt) {
                    evt.preventDefault();
                    router.navigate(evt.currentTarget.pathname)
                }
            }, 'Books'),
            ' ',
            p('a', {
                href: '/authors', onclick(evt) {
                    evt.preventDefault();
                    router.navigate(evt.currentTarget.pathname)
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
                href: '/hello', textContent: 'Перейти на привітання', onclick(evt) {
                    evt.preventDefault();
                    router.navigate(evt.currentTarget.pathname)
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


const app = new App();
const router = new Router();
const model = new Model();

const booksController = new BooksController();
const authorsController = new AuthorsController();

router
    .add('/', renderRoot)
    .add('/books', booksController.index)
    .add(/(\/books\/)(\d+)$/, booksController.show)
    .add(/(\/books\/)(\d+)(\/authors)$/, booksController.showAuthors)
    .add('/authors', authorsController.index)
    .add(/(\/authors\/)(\d+)$/, authorsController.show)
    .add(/(\/authors\/)(\d+)(\/books)$/, authorsController.showBooks)
    .add('*', renderNotFound);

model.defineModel({
    name: 'author',
    fields: {
        id: {type: 'string'},
        fullName: {type: 'string', defaultTo: 'No name', required: true},
        avatarUrl: {type: 'string', defaultTo: 'http://placehold.it/100x300'},
        dateOfDeath: {type: 'string', defaultTo: 'No date'},
        city: {type: 'string', defaultTo: 'No city'},
        books: {ref: 'book'}
    }
});

model.defineModel({
    name: 'book',
    fields: {
        id: {type: 'string'},
        title: {type: 'string', defaultTo: 'No title'},
        image: {type: 'string', defaultTo: 'http://placehold.it/100x300'},
        genre: {type: 'string', defaultTo: 'No genre'},
        year: {type: 'string', defaultTo: 'No date'},
        authors: {ref: 'author'}
    }
});

model.author.insert({
    id: '1',
    fullName: 'Shevcheno',
    avatarUrl: '',
    dateOfDeath: '',
    city: '',
    books: ['1']
});

model.author.insert({
    id: '2',
    fullName: 'Franko',
    avatarUrl: '',
    dateOfDeath: '',
    city: '',
    books: ['1']
});

model.book.insert({
    id: '1',
    title: 'Book of Death Man',
    //image: 'http://placehold.it/150x300',
    //genre: 'Novel',
    year: '2000',
    authors: ['1', 2, 3]
});

model.book.insert({
    id: '2',
    title: 'Book of Second Death Man',
    image: 'http://placehold.it/150x300',
    genre: 'Novel',
    year: '2001',
    authors: ['2']
});