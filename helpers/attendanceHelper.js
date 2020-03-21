let courseHelper = require("../helpers/courseHelper");

let weekday = new Array(7);

weekday[0]="Monday";
weekday[1]="Tuesday";
weekday[2]="Wednesday";
weekday[3]="Thursday";
weekday[4]="Friday";
weekday[5]="Saturday";
weekday[6]="Sunday";

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

module.exports.validHour = (checkHour, classHour) => {
  let splittedHour = classHour.split("-");
  let checkDate = courseHelper.convertDate(checkHour);
  let startDate = courseHelper.convertDate(splittedHour[0]);
  let endDate = courseHelper.convertDate(splittedHour[1]);
  return startDate <= checkDate && checkDate <= endDate;
};

//Unfinished
module.exports.studentChecked = async (username, attRequest) => {
  let dayList = await courseModel.exists({
    _id: mongoose.Types.ObjectId(attRequest.courseId),
    attendanceList: attRequest.date
  });
  if (dayList.length) {
    let listFilter = dayList[0].attendanceList
  } else return false;
}