const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const GlobalErrorHandler = require('./controllers/errorController');
const webhookCheckout = require('./controllers/bookingController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.enable('trust proxy');

// Global Middlewares
// Implement CORS
app.use(cors());
//Implement cors form non-simple request (preflight phase)
app.options('x', cors());
// Set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too Many Requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// the reason for putting is here and not in the bookingCOntroller is that we dont want the webhook to be in Json => Before express parser
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  webhookCheckout.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Compression
app.use(compression());
// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// console.log(process.env.NODE_ENV);

// Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't Find ${req.originalUrl} on this Server!!!`, 404));
});

app.use(GlobalErrorHandler);
module.exports = app;
