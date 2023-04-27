var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var videoRouter = require("./routes/video");
var targetRouter = require("./routes/target");
var bodyartRouter = require("./routes/bodypart");
var bmiRouter = require("./routes/bmi");
var userTargetRouter = require("./routes/usertarget");
var db = require('./models');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/videos', videoRouter);
app.use('/targets', targetRouter);
app.use('/bodyparts', bodyartRouter);
app.use('/bmi', bmiRouter);
app.use('/user-targets', userTargetRouter);

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

const initDatabase = async () => {
  try {
      await db.sequelize.authenticate();
      console.log('Connection has been established successfully.');

      // await sequelize.sync({ alter: true }); // alter can break association
      //await db.sequelize.sync({force: true}); // force can break association
      console.log('All models were synchronized successfully.');
  } catch (error) {
      console.error('Error at database init:', error);
  }
};

app.listen(5000, async () => {
  await initDatabase();
  console.log(`Example app listening on port 5000`);
})

module.exports = app;
