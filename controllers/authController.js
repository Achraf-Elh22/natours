const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if the meail and password exist
  if (!email || !password) return next(new AppError('Please Procide email and password', 400));

  // Check if The email && password is Correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // If everything is ok send a token to the client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1)getting The token and check if it's there
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('You are not logged in! Please log in to get access!', 401));

  // 2) verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if the user still exists
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("The uesr belonging to this token doesn't exist anymore."));

  // 4) Check if user changed password after the token was issued
  if (user.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User Recently changed password! Please log in again', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin","lead-guide"]. role = "user"
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have the permission to perform this action", 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based email on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with this email address', 404));

  // 2) Generate the random reset secret
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3)Send it to the user's email
});

exports.resetPassword = (req, res, next) => {};
