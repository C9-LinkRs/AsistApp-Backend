let express = require("express");
let jsonWebToken = require("jsonwebtoken");

const courseModel = require("../models/course");
const userModel = require("../models/user");

const userHelper = require("../helpers/userHelper");

let router = express.Router();

router.get("/", async (request, response) => {
  try {
    let dbResponse = await courseModel.find();

    response.json({
      statusCode: 200,
      dbResponse
    });
  } catch (error) {
    console.log(error);
    response.json({
      statusCode: 500,
      message: "error fetching data"
    });
  }
});

router.post("/create", async (request, response) => {
  let accessToken = request.headers.authorization;
  let courseRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    if (courseRequest && !await courseExists(courseRequest.name, decodedToken.username) && await userHelper.teacherExists(decodedToken.username) && courseRequest.startDate && courseRequest.endDate) {
      if (await teacherCanCreateCourse(courseRequest, decodedToken.username)) {
        let newCourse = new courseModel({
          name: courseRequest.name,
          teacherUsername: decodedToken.username,
          schedule: courseRequest.schedule,
          startDate: courseRequest.startDate,
          endDate: courseRequest.endDate
        });
        await newCourse.save();
        response.json({
          statusCode: 200,
          message: "course added successful"
        });
      } else {
        response.json({
          statusCode: 200,
          message: "teacher can not create the course due to conflict matrix"
        });
      }
    } else if (await courseExists(courseRequest.name, decodedToken.username)) {
      response.json({
        statusCode: 200,
        message: "course already exists"
      });
    } else {
      response.json({
        statusCode: 400,
        message: "bad request"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "interal server error"
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

router.delete("/delete", async (request, response) => {
  let accessToken = request.headers.authorization;
  let courseRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    if (await courseExists(courseRequest.name, decodedToken.username)) {
      await courseModel.findOneAndDelete({
        teacherUsername: decodedToken.username,
        name: courseRequest.name
      });
      response.json({
        statusCode: 200,
        message: "course deleted"
      });
    } else {
      response.json({
        statusCode: 404,
        message: "course not found"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "internal server error";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

router.post("/addStudent", async (request, response) => {
  let accessToken = request.headers.authorization;
  let courseRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    if (await userHelper.studentExists(decodedToken.username) && await courseExists(courseRequest.name, courseRequest.teacherUsername)) {
      if (await studentCanTakeCourse(courseRequest, decodedToken.username)) {
        let processResponse = await addStudentToCourse(courseRequest, decodedToken.username);
        response.json({
          statusCode: 200,
          message: processResponse
        });
      } else {
        response.json({
          statusCode: 200,
          message: "student can not sign up the course due to conflict matrix"
        })
      }
    } else {
      response.json({
        statusCode: 404,
        message: "student or course not found"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "internal server error";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

router.delete("/deleteStudent", async (request, response) => {
  let accessToken = request.headers.authorization;
  let courseRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    if (await userHelper.studentExists(decodedToken.username) && await courseExists(courseRequest.name, courseRequest.teacherUsername)) {
      let processResponse = await deleteStudentFromCourse(courseRequest, decodedToken.username);
      response.json({
        statusCode: 200,
        message: processResponse
      });
    } else {
      response.json({
        statusCode: 404,
        message: "student or course not found"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "internal server error";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

async function courseExists(name, teacherUsername) {
  return await courseModel.exists({
    name,
    teacherUsername
  });
}

async function teacherCanCreateCourse(newCourseSchedule, teacherUsername) {
  let teacherCourses = await courseModel.find({ teacherUsername });
  if (teacherCourses.length) {
    for (let course of teacherCourses) {
      let schedule = course.schedule;
      if (!sameSemester(course, newCourseSchedule)) continue;
      if (conflictMatrix(schedule, newCourseSchedule.schedule)) return false;
    }
  }
  return true;
}

async function studentCanTakeCourse(courseInfo, studentUsername) {
  let courseToSignUp = await courseModel.find({
    name: courseInfo.name,
    teacherUsername: courseInfo.teacherUsername
  });
  let studentSchedule = await courseModel.find({
    "students": { $in: [studentUsername] }
  });
  if (courseToSignUp.length && studentSchedule.length) {
    for (let course of studentSchedule) {
      let schedule = course.schedule;
      if (!sameSemester(course, courseToSignUp[0])) continue;
      if (conflictMatrix(schedule, courseToSignUp[0].schedule)) return false;
    }
  }
  return true;
}

async function addStudentToCourse(courseRequest, studentUsername) {
  let courseList = (await courseModel.find({
    name: courseRequest.name,
    teacherUsername: courseRequest.teacherUsername
  }))[0].students;
  let studentFilter = courseList.filter(student => student === studentUsername);

  if (!studentFilter.length) {
    courseList.push(studentUsername);
    await courseModel.updateOne({
      name: courseRequest.name,
      teacherUsername: courseRequest.teacherUsername
    }, { students: courseList });
    return "student added to course";
  } else return "student is already signed up";
}

async function deleteStudentFromCourse(courseRequest, studentUsername) {
  let courseList = (await courseModel.find({
    name: courseRequest.name,
    teacherUsername: courseRequest.teacherUsername
  }))[0].students;

  let studentFilter = courseList.filter(student => student === studentUsername);
  if (studentFilter.length) {
    courseList = courseList.filter(student => student !== studentUsername);
    await courseModel.updateOne({
      name: courseRequest.name,
      teacherUsername: courseRequest.teacherUsername
    }, { students: courseList });
    return "student deleted from course";
  } else return "student does not signed up to this course";

}

function sameSemester(course, newCourse) {
  let courseStart = new Date(course.startDate);
  let courseEnd = new Date(course.endDate);
  let newCourseStart = new Date(newCourse.startDate);
  let newCourseEnd = new Date(newCourse.endDate);
  return classContainsCourse(courseStart, courseEnd, newCourseStart, newCourseEnd) || courseContainsClass(courseStart, courseEnd, newCourseStart, newCourseEnd);
}

function conflictMatrix(schedule, newCourseSchedule) {
  let scheduleFilter = schedule.filter(classHour => hoursInCommon(classHour, newCourseSchedule));
  return scheduleFilter.length;
}

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

module.exports = router;