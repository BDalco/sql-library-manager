const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const createError = require('http-errors');

/* Handler function to wrap each route */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET full list of books */
router.get('/', asyncHandler(async(req, res) => {
  const books = await Book.findAll({
    order: [["createdAt", "DESC"]]
  });
  res.render('books/index',  { books, title: "Books" });
}));

/* GET create new book form */
router.get('/new', (req, res) => {
  res.render('books/new-book', { book: {}, title: 'New Book'});
})

/* POST new book to database */
router.post('/new', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('books/new-book', { book, errors: error.errors, title: 'New Book' });
    } else {
      throw error;
    }
  }
}));

/* GET individual book details */
router.get('/:id', asyncHandler(async(req, res, next) => {
  const id = req.params.id;
  let book = await Book.findByPk(id);
  if(book){
    res.render('books/update-book', { book, title: 'Update Book' });
  } else {
    next(createError(404, 'Not Found'));
  }
}));

/* POST update info in database */
router.post('/:id', asyncHandler(async(req, res, next) => {
  const id = req.params.id;
  let book;
  try {
    book = await Book.findByPk(id);
    if(book) {
      await book.update(req.body);
      res.redirect(`/`);
    } else {
      next(createError(404, 'Not Found'));
    }
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('books/update-book', { book, errors: error.errors, title: 'Update Book' });
    } else {
      throw error;
    }
  }  
}));

/* GET delete book form */
router.get("/:id/delete", asyncHandler(async (req, res) => {
  const id = req.params.id;
  let book = await Book.findByPk(id);
  if(book) {
    res.render("books/delete", { book, title: "Delete Book" });
  } else {
    res.sendStatus(404);
  }
}));

/* POST delete a book */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const id = req.params.id;
  let book = await Book.findByPk(id);
  if(book) {
    await book.destroy();
    res.redirect('/');
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;