const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');

//reads in configuration from a .env file
require('dotenv').config();
require('./utils/db');
require('./passport')(passport);

var app = express();

//CORS middleware
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

require('./socket.io')(app)

//sets the required variables from Environment Variables.
// const port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/auth');
app.use('/auth', passport.authenticate('jwt', { session: false }), indexRouter);

const profileRouter = require('./routes/profile');
app.use('/me', profileRouter);

require('./routes/users')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
