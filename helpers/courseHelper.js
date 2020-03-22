let mongoose = require("mongoose");

let courseModel = require("../models/course");

module.exports.courseExists = async (name, teacherUsername) => {
  return await courseModel.exists({
    name,
    teacherUsername
  });
};

module.exports.courseExists = async (courseId) => {
  return await courseModel.exists({ _id: mongoose.Types.ObjectId(courseId) });
};

module.exports.sameSemester = (course, newCourse) => {
  let courseStart = new Date(course.startDate);
  let courseEnd = new Date(course.endDate);
  let newCourseStart = new Date(newCourse.startDate);
  let newCourseEnd = new Date(newCourse.endDate);
  return classContainsCourse(courseStart, courseEnd, newCourseStart, newCourseEnd) || courseContainsClass(courseStart, courseEnd, newCourseStart, newCourseEnd);
}

module.exports.conflictMatrix = (schedule, newCourseSchedule) => {
  let scheduleFilter = schedule.filter(classHour => hoursInCommon(classHour, newCourseSchedule));
  return scheduleFilter.length;
}

module.exports.convertDate = (stringDate) => {
  return convertDate(stringDate);
};

function hoursInCommon(classHour, newCourseSchedule) {
  let sameHours = newCourseSchedule.filter(newCourseClassHour => classHour.day === newCourseClassHour.day);
  for (let courseClassHour of sameHours) {
    let courseHourArray = courseClassHour.hours.split("-");
    let classHourArray = classHour.hours.split("-");

    let courseStart = convertDate(courseHourArray[0]);
    let courseEnd = convertDate(courseHourArray[1]);

    let classStart = convertDate(classHourArray[0]);
    let classEnd = convertDate(classHourArray[1]);

    if (classContainsCourse(classStart, classEnd, courseStart, courseEnd) || courseContainsClass(classStart, classEnd, courseStart, courseEnd)) return true;
  }
  return false;
}

function convertDate(stringDate) {
  return new Date(`1/1/1111 ${stringDate}`);
}

function classContainsCourse(classStart, classEnd, courseStart, courseEnd) {
  return classStart <= courseStart && courseStart <= classEnd || classStart <= courseEnd && courseEnd <= classEnd;
}

function courseContainsClass(classStart, classEnd, courseStart, courseEnd) {
  return courseStart <= classStart && classStart <= courseEnd || courseStart <= classEnd && classEnd <= courseEnd;
}