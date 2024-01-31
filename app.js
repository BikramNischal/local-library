const dotenv = require("dotenv").config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require("compression");
const helmet = require("helmet");
const debug = require("debug")("Database:connection");


// Set up mongoose connection
const mongoose  = require("mongoose");
mongoose.set("strictQuery", false);
const libraryDB = process.env.DB_URL;
 
testConnection().catch(err => console.err(err));
async function testConnection(){
  await mongoose.connect(libraryDB);
  debug("Database Connection Successful!");
}


// router setup
const indexRouter = require('./routes/index');
const catalogRouter = require('./routes/catalog');

const app = express();

const RateLimit= require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1*60*1000,
  max: 20,
});

app.use(limiter);

app.use(helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
