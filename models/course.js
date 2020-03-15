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
    required: true
  }
});

module.exports = mongoose.model('Course', courseSchema);