const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
// Database
const db = require('./config/database');

// Test DB
db.authenticate()
  .then(() => console.log('Database connected...')
  )
  .catch(err => console.log('Error: ' + err))

const app = express();

//My Routes -> load routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

//@cors
app.use(cors());
app.use(cookieParser());
//@logger
app.use(logger('dev'));
//@Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// test route
app.get('/', (req, res) => res.send({ message: 'welcome to node express backend server' }));

// Routes
app.use('/api', authRoutes);
app.use('/api', adminRoutes);

const PORT = process.env.PORT || 5000;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
})

//error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = errr.message;
    res.locals.error = req.app.get('env') === 'development' ? err: {};
    // send error
    res.status(err.status || 500);
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));