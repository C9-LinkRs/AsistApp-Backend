let mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isEmail(value);
    }
  },
  isTeacher: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isBoolean(value);
    }
  },
  qrCode: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isDataURI(value);
    }
  }
});

module.exports = mongoose.model('User', userSchema);