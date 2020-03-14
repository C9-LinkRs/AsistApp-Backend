let mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  teacherUsername: {
    type: String,
    required: true
  },
  students: {
    type: Array,
    required: false
  },
  schedule: {
    type: Array,
    required: false
  }
});

module.exports = mongoose.model('Course', courseSchema);