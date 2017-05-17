import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';

import Book from './Book.jsx';
import Author from './Author.jsx';

class Poets extends React.Component {
	renderBooks() {
		return model.book.findAll().map(book => <Book key={book.id} book={book} />);
	}

	renderAuthors() {
		return model.author.findAll().map(author => <Author key={author.id} author={author} />);
	}

	 render() {  	 
    	return (
    		<div>   			
    			<strong>Death poets' community</strong><br/>
    			<button onClick={this.props.history.goBack}> Back </button> 

    			<button onClick={this.props.showBooks} >Books</button>
                <button onClick={this.props.showAuthors}>Authors</button>

				<button onClick={this.props.history.goForward}> Forward </button>
				{this.props.show ? this[this.props.show]() : ''}				
    		</div>

    	);
    }
}

const mapStateToProps = (state, props) => {
  return {
    show: state.poets.show
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showBooks() {
      dispatch({ type: 'showBooks' })
    },
    showAuthors() {
      dispatch({ type: 'showAuthors' })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Poets);




//Realisation to use localStorage from last practice lessons
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
            delete this._data[id];
            this._commit();//Save data in localStorage
            this._data = this._getInitialData();
        } catch (e) {
            throw new Error('Error: can\'t remove');
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

    search(byValue) {
        let pattern = new RegExp('(' + byValue + ')', 'i');//Create pattern for search data
        let data = this.findAll();//Get all data

        //Find data by pattern
        let foundData = data.filter((elem) => {
            let elemKeys = Object.keys(elem);//Get fields keys from element

            //Check field value by pattern
            return elemKeys.some((key) => {
                if (typeof elem[key] === 'string') {
                    return elem[key].match(pattern);
                }
                return false;
            });
        });

        return foundData;
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

const model = new Model();


model.defineModel({
    name: 'author',
    fields: {
        id: {type: 'string'},
        fullName: {type: 'string', defaultTo: 'No name', required: true},
        avatarUrl: {type: 'string', defaultTo: 'http://placehold.it/100x300'},
        dateOfDeath: {type: 'string', defaultTo: 'No date'},
        city: {type: 'string', defaultTo: 'No city'},
        // books: {ref: 'book'}
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
        // authors: {ref: 'author'}
    }
});
model.setRefData();


model.author.insert({
   id: '1',
   fullName: 'Shevcheno',
   avatarUrl: 'http://placehold.it/150x300',
   dateOfDeath: '',
   city: '',
   books: ['1']
});

model.author.insert({
   id: '2',
   fullName: 'Franko',
   avatarUrl: 'http://placehold.it/150x300',
   dateOfDeath: '',
   city: '',
   books: ['1']
});

model.book.insert({
   id: '1',
   title: 'Book of Death Man',
   image: 'http://placehold.it/150x150',
   genre: '',
   year: '2000',
   authors: ['1']
});

model.book.insert({
   id: '2',
   title: 'Book of Second Death Man',
   image: 'http://placehold.it/150x150',
   genre: 'Novel',
   year: '2001',
   authors: ['2']
});