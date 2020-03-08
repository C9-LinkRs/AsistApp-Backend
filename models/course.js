let mongoose = require("mongoose");
const validator = require("validator");

const courseSchema = new mongoose.Schema({
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