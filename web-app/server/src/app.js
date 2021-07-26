const express = require('express')
const cors = require('cors')
var logger = require('morgan')

// Pool init
const pool = require('./db/createPool')
const createTable = require('./db/createTable')
const dropTableTasks = require('./db/dropTable');

// Uploading files:
const fileUpload = require('express-fileupload'); // Simple Express middleware for uploading files
const morgan = require('morgan');
const _ = require('lodash');

var algsInfo = require('./routes/algsInfo');
var chooseTaskRouter = require('./routes/chooseTask');
var createTaskRouter = require('./routes/createTask');
var uploadRouter = require('./routes/upload');

// Confurating DB tables
dropTableTasks(pool)
  .then((err, res) => createTable(pool))

const app = express()
app.set('pool', pool);
const jsonParser = express.json();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());

// enable files upload
app.use(fileUpload({
  createParentPath: true
}));

app.use(morgan('dev'));

// POST requests
app.post('/chooseTask', jsonParser, chooseTaskRouter);
app.post('/createTask', jsonParser, createTaskRouter);

// Upload file
app.post('/upload', uploadRouter);

// GET requests
app.use('/algsInfo', algsInfo);
app.use('/', (req, res) => {
    
  res.send('Hello World! (root route)')
});

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