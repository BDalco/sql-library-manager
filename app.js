var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sequelize = require('./models/').sequelize;

(async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection to the database successful!');
	} catch (error) {
		console.error('Error connecting to the database: ', error);
	}
})();

(async () => {
	try {
		await sequelize.sync();
		console.log('Model synced with the database');
	} catch (error) {
		console.error('Failed to sync model with the database:', error);
	}
})();

var indexRouter = require('./routes/index');
var books = require('./routes/books');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', books);

// find 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err.status);
  console.log(err.message);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

	if (err.status === 404) {
    res.render('page-not-found');
  } else {
  	res.render('error', { title: "Server Error", err });
	}
});

module.exports = app;
