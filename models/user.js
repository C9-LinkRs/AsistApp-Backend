let mongoose = require("mongoose");
let validator = require("validator");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isAlphanumeric(value);
    }
  },
  password: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isAlphanumeric(value);
    }
  },
  email: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isEmail(value);
    }
  },
  isTeacher: {
    type: Boolean,
    required: true,
    validate: (value) => {
      return validator.isBoolean(value);
    }
  }
});

module.exports = mongoose.model('User', userSchema);