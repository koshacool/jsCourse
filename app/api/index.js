const winston = require('winston');
const home = require('../controllers/home');
const Book = require('../models/book');
const User = require('../models/user');
const passport = require('passport');

const handleError = (res, onSuccess) => (err, result) => {
    if (err) {
        winston.error(err);
        res.status(500).send('Unknown error');
    } else {
        onSuccess(result);
    }
};

module.exports = function (app) {
    app.route('/api/books')
        .get(function (req, res, next) {
            Book.find({}, handleError(res, function (result) {
                // res.status(200).send(result);
                home.books(req, res, result);
            }));
        });

    app.route('/api/books/:_id')
        .get(function (req, res, next) {
            Book.findOne({_id: req.params._id}, handleError(res, function (result) {
                res.status(200).send(result);
            }));
        });

    app.route('/api/add')
        .get(function (req, res, next) {
            home.addBook(req, res, false);
        })
        .post(function (req, res, next) {
            const bookDoc = req.body;
            bookDoc.ownerId = req.user._id;
            const book = new Book(bookDoc);

            book.save(handleError(res, function (result) {
                return res.redirect('/api/books');
            }));
        })

    app.route('/api/edit/:_id')
        .post(function (req, res, next) {

            Book.findOne({_id: req.params._id}, handleError(res, function (result) {
                console.log(result)
                if (req.user._id == result.ownerId) {
                    const bookDoc = req.body;
                    bookDoc.ownerId = req.user._id;
                    const book = new Book(bookDoc);

                    book.update(handleError(res, function (result) {
                        return res.redirect('/api/books');
                    }));
                    return res.redirect('/api/books');
                } else {
                    return res.status(500).send('It isn\'t your note');
                }

            }));
        })
        .get(function (req, res, next) {
            Book.findOne({_id: req.params._id}, handleError(res, function (result) {
                home.editBook(req, res, result);
            }));
        })


    app.route('/api/books/remove/:_id')
        .get(function (req, res, next) {
            Book.findOne({_id: req.params._id}, handleError(res, function (result) {
                if (req.user._id == result.ownerId) {
                    Book.remove(result).exec();
                    return res.redirect('/api/books');
                } else {
                    return res.status(500).send('It isn\'t your note');
                }

            }));
        });

    app.route('/')
        .get(function (req, res, next) {
            if (req.user) {
                return res.redirect('/api/books');
            }
            home.auth(req, res);
        });

    app.route('/auth')
        .get(function (req, res, next) {
            if (req.user) {
                return res.redirect('/api/books');
            }
            home.auth(req, res);
        })
        .post(function (req, res, next) {
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.redirect('/auth');
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    console.log(req.user)
                    return res.redirect('/api/books');
                });
            })(req, res, next);
        })

    app.route('/register')
        .get(home.register)
        .post(function (req, res, next) {
            const user = new User(req.body);
            user.save(handleError(res, function (result) {
                res.status(200).send(result);
            }));
        });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });


};
