let mongoose = require("mongoose");
let validator = require("validator");

let courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isAlphanumeric(value);
    }
  },
  teacherId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Course', courseSchema);