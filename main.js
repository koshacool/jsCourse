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
        // this[options.name]._data = this[options.name]._getInitialData();
    }

    setRefData() {
        let keys = Object.keys(this);
        keys.map((key) => {
            this[key]._data = this[key]._getInitialData();
        });
    }
};

class Collection {
    constructor(options, rootModel) {
        this._rootModel = rootModel;
        this._name = options.name;
        this._fields = options.fields;
        // this._data = null;
    }

    insert(data) {
        let validData = this._validateData(data);
        if (validData) {
            if (!this._data) {
                this._data = {};
            }
            this._data[validData.id] = validData;

            this._commit();//Save data in localStorage
            this._data = this._getInitialData();
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
        let elements = [];
        if (this._data) {
            let keys = Object.keys(this._data);
            elements = keys.map(key => this._data[key]);

        }

        return elements;
    }

    _getInitialData() {
        try {
            let data = null;
            const initialData = store.get(this._name);
            if (initialData) {
                data =  JSON.parse(initialData);
                this._addRefFunction(data);
            }

            return data;
        } catch (e) {
            console.log(e.message);
        }
    }

    _addRefFunction(data) {
        let keys = Object.keys(data);

        let newData = keys.map((key) => {
            let ref = data[key].ref;
            let refData = data[key][ref + 's'];
                data[key]['_' + ref] = () => refData.map((refId) => {
                    return this._rootModel[ref].find(refId);
                });
        });

    }

    _validateData(data) {
        const validation = {
            ref: (dataKey, value, param) => {
                //console.log(param)
                data.ref = param;
                //const refKey = '_' + param;
                //data[refKey] =  () => {
                //    return data[dataKey].map(id => this._rootModel[param].find(id, 'id'));
                //}
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
                var result = (validation[param])(key, data[key], objectParams[param]);
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
    index() {
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
        renderView(createRenderData(renderAuthorsIndex, authors));
    }

    add() {
        let app = document.getElementById('app');
        let books = document.getElementById('books');
        let authors = model.author.findAll();
        app.appendChild(renderBooksAdd(authors));
        books.style.opacity = 0.1;
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

    add() {
        let app = document.getElementById('app');
        let authors = document.getElementById('authors');
        let books = model.book.findAll();
        app.appendChild(renderAuthorsAdd(books));
        authors.style.opacity = 0.1;
    }


};

class Form {
    saveBook() {
        let id = 1;
        let allBooks = model.book.findAll();
        //console.log(allBooks);
        if(allBooks.length > 0) {
            let lastBook = allBooks[allBooks.length - 1];
            id = parseInt(lastBook.id) + 1;
        }

        let form = document.getElementById('addBook');
        let inputs = form.elements;
        let book = {
            id: id.toString(),
            title: inputs.title.value,
            image: inputs.image.value,
            genre: inputs.genre.value,
            year: inputs.year.value,
            authors: inputs.authors.value ? [inputs.authors.value] : []
        };
        model.book.insert(book);
        router.navigate('/books');
    }
}

function renderView(view) {
    const root = document.getElementById('app');

    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }

    root.appendChild(renderHeader());
    root.appendChild(view);
};

function createRenderData(funcName, data = null) {
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
        p('div', {className: 'block'}, [
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

    return p('div', {className: 'books', id: 'books'}, [
        p('a', {
            href: '/books/add', onclick(evt) {
                evt.preventDefault();
                router.navigate(evt.currentTarget.pathname);
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

function renderBooksAdd(authors, book = null) {

    const renderAuthors = author =>
        p('option', {id: 'author' + author.id, value: author.id}, author.fullName);


    return p('div', {
        className: 'form',
        style: {
            opacity: 1,
            position: 'absolute',
            top: '20%',
            width: '400px',
            left: '40%',

        }}, [
        p('form', {
            className: 'form',
            id: 'addBook',
            onsubmit(evt) {
                evt.preventDefault();
                saveForm.saveBook();
            }}, [
            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Title: '),
            p('input', {
                name: 'title',
                type: 'text',
            }, 'Title'),
            p('br'),

            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Image url: '),
            p('input', {
                name: 'image',
                type: 'text',
            }, 'Image url'),
            p('br'),

            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Genre: '),
            p('input', {
                name: 'genre',
                type: 'text',
            }, 'Genre'),
            p('br'),

            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Year: '),
            p('input', {
                name: 'year',
                type: 'text',
            }, 'date'),
            p('br'),



            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Authors: '),
            p('select', {name: 'authors', id: 'authors',  style: {}}, authors ? authors.map(renderAuthors) : ''),
            p('br'),

            p('button', {
                type: 'submit'
            }, 'Add'),

            p('a', {
                href: '#', textContent: 'Back', onclick(evt) {
                    evt.preventDefault();
                    router.navigateBack()
                }
            })
        ]),
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

    return p('div', {className: 'authors', id: 'authors'}, [
        p('a', {
            href: '/authors/add', onclick(evt) {
                evt.preventDefault();
                router.navigate(evt.currentTarget.pathname);
            }
        }, 'Add new author'),
        p('div', {className: 'authors'}, data.map(renderBook))
    ]);
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

function renderAuthorsAdd(books, author = null) {

    const renderBooks = book =>
        p('option', {id: 'book' + book.id, value: book.id}, book.fullName);


    return p('div', {
        className: 'form',
        style: {
            opacity: 1,
            position: 'absolute',
            top: '20%',
            width: '400px',
            left: '40%',

        }}, [
        p('form', {
            className: 'form',
            id: 'addAuthor',
            onsubmit(evt) {
                evt.preventDefault();
                saveForm.saveAuthor();
            }}, [
            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Title: '),
            p('input', {
                name: 'title',
                type: 'text',
            }, 'Title'),
            p('br'),

            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Image url: '),
            p('input', {
                name: 'image',
                type: 'text',
            }, 'Image url'),
            p('br'),

            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Genre: '),
            p('input', {
                name: 'genre',
                type: 'text',
            }, 'Genre'),
            p('br'),

            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Year: '),
            p('input', {
                name: 'year',
                type: 'text',
            }, 'date'),
            p('br'),



            p('span', {style: {width: '80px', display: 'inline-block'}}, 'Authors: '),
            p('select', {name: 'books', id: 'books',  style: {}}, books ? books.map(renderBooks) : ''),
            p('br'),

            p('button', {
                type: 'submit'
            }, 'Add'),

            p('a', {
                href: '#', textContent: 'Back', onclick(evt) {
                    evt.preventDefault();
                    router.navigateBack()
                }
            })
        ]),
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
const saveForm = new Form();
const booksController = new BooksController();
const authorsController = new AuthorsController();

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

model.setRefData();

router
    .add('/', renderRoot)
    .add('/books', booksController.index)
    .add(/(\/books\/)(\d+)$/, booksController.show)
    .add(/(\/books\/)(\d+)(\/authors)$/, booksController.showAuthors)
    .add('/books/add', booksController.add)
    //.add(/(\/books\/)(\/add\/)(\d+)$/, booksController.edit)

    .add('/authors', authorsController.index)
    .add(/(\/authors\/)(\d+)$/, authorsController.show)
    .add(/(\/authors\/)(\d+)(\/books)$/, authorsController.showBooks)
    .add('/authors/add', authorsController.add)
    .add('*', renderNotFound);




// model.author.insert({
//    id: '1',
//    fullName: 'Shevcheno',
//    avatarUrl: '',
//    dateOfDeath: '',
//    city: '',
//    books: ['1']
// });
//
//model.author.insert({
//    //id: '',
//    fullName: 'Franko',
//    avatarUrl: '',
//    dateOfDeath: '',
//    city: '',
//    books: ['1']
//});
//
//model.book.insert({
//    //id: '',
//    title: 'Book of Death Man',
//    //image: 'http://placehold.it/150x300',
//    genre: '',
//    year: '2000',
//    authors: ['1', 2, 3]
//});
//
//model.book.insert({
//    //id: '',
//    title: 'Book of Second Death Man',
//    image: 'http://placehold.it/150x300',
//    genre: 'Novel',
//    year: '2001',
//    authors: ['2']
//});