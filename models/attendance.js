let mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  attendanceList: {
    type: Array,
    required: false
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);