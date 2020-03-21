let mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: {
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
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  attendanceList: {
    type: Array,
    required: false
  }
});

module.exports = mongoose.model("Course", courseSchema);