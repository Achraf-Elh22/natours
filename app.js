const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Global Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too Many Requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

console.log(process.env.NODE_ENV);
// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use('*', (req, res, next) => {
  // const err = new Error(`Can't Find ${req.originalUrl} on this Server!!!`);
  // err.statusCode = 404;
  // err.status = 'Fail';

  next(new AppError(`Can't Find ${req.originalUrl} on this Server!!!`, 404));
});

app.use(GlobalErrorHandler);

module.exports = app;
