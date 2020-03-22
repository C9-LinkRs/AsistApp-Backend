let mongoose = require("mongoose");

let courseModel = require("../models/course");

let courseHelper = require("../helpers/courseHelper");

let weekday = new Array(7);

weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

module.exports.convertDay = day => {
  return weekday[day];
};

module.exports.isLate = (checkHour, classHour) => {
  let splittedHour = classHour.split("-");
  let checkDate = courseHelper.convertDate(checkHour);
  let startDate = courseHelper.convertDate(splittedHour[0]);
  let diff = Math.abs(checkDate.getTime() - startDate.getTime()) / 1000;
  let minutes = diff / 60;
  return minutes > 15;
};

module.exports.validSemesterDay = (checkDate, courseClassDay) => {
  let startDate = new Date(courseClassDay.startDate);
  let endDate = new Date(courseClassDay.endDate);
  let classDay = new Date(checkDate);
  return startDate <= classDay && classDay <= endDate;
};

module.exports.getClassHours = (checkDate, courseSchedule) => {
  let classDay = new Date(checkDate);
  let classDayName = this.convertDay(classDay.getDay());
  let courseClassDayFilter = courseSchedule.filter(courseClassDay => courseClassDay.day === classDayName);
  return (courseClassDayFilter.length) ? courseClassDayFilter[0].hours : undefined;
};

module.exports.validHour = (checkHour, classHour) => {
  let splittedHour = classHour.split("-");
  let checkDate = courseHelper.convertDate(checkHour);
  let startDate = courseHelper.convertDate(splittedHour[0]);
  let endDate = courseHelper.convertDate(splittedHour[1]);
  return startDate <= checkDate && checkDate <= endDate;
};

module.exports.studentChecked = async (username, attRequest) => {
  let course = await courseModel.find({
    _id: mongoose.Types.ObjectId(attRequest.courseId)
  });
  if (course.length) {
    let listFilter = course[0].attendanceList.filter(record => record.username === username && record.date === attRequest.date);
    return listFilter.length;
  } else return false;
}