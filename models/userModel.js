const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // This Only work on save() and create()
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt: Date,
});

// Set correctPassword as global method on all the documents
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Encrypt the password
userSchema.pre('save', async function (next) {
  // Only Run if Password actually modified
  if (!this.isModified('password')) return next();

  // Generate Hash from Password
  this.password = await bcrypt.hash(this.password, 12);
  // delete Confirm password
  this.passwordConfirm = undefined;
});

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return changedTimestamp > JWTTimestamp;
  }

  // False mean Password Not Changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
