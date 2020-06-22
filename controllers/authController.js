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


exports.protect = catchAsync(async (req,res,next){
  
})