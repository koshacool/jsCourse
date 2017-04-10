
/*!
 * Module dependencies.
 */

exports.index = function (req, res) {
  res.render('home/index', {
    user : req.user,
    title: 'Node Express Mongoose Boilerplate'
  });
};

exports.auth = function (req, res) {
    res.render('home/auth', {
        user : req.user,
        title: 'Node Express Mongoose Boilerplate'
    });
};

exports.register = function (req, res) {
    res.render('home/register', {
        user : req.user,
        title: 'Node Express Mongoose Boilerplate'
    });
};

exports.books = function (req, res, result) {
    // console.log(result)
    res.render('home/books', {
        user : req.user,
        books : result,
        title: 'Node Express Mongoose Boilerplate'
    });
};

exports.addBook = function (req, res, result) {
    res.render('home/addBook', {
        user : req.user,
        book: result,
        title: 'Node Express Mongoose Boilerplate'
    });
};

exports.editBook = function (req, res, result) {
    res.render('home/editBook', {
        user : req.user,
        book: result,
        title: 'Node Express Mongoose Boilerplate'
    });
};