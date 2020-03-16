let express = require("express");
let jsonWebToken = require("jsonwebtoken");

const courseModel = require("../models/course");
const userModel = require("../models/user");

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

    conflictMatrix(courseRequest.schedule, decodedToken.username);
    if (!await courseExists(courseRequest.name, decodedToken.username) && await teacherExists(decodedToken.username)) {
      let newCourse = new courseModel({
        name: courseRequest.name,
        teacherUsername: decodedToken.username,
        schedule: courseRequest.schedule
      });
      await newCourse.save();
      response.json({
        statusCode: 200,
        message: "course added successful"
      });
    } else if (courseExists(courseRequest.name, decodedToken.username)) {
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

    if (await studentExists(decodedToken.username) && await courseExists(courseRequest.name, courseRequest.teacherUsername)) {
      let response = await addStudentToCourse(courseRequest, decodedToken.username);
      response.json({
        statusCode: 200,
        message: response
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

router.delete("/deleteStudent", async (request, response) => {
  let accessToken = request.headers.authorization;
  let courseRequest = request.body;
  try {
    let decodedToken = json.verify(accessToken, process.env.SECRET_KEY);

    if (await studentExists(decodedToken.username) && await courseExists(courseRequest.name, courseRequest.teacherUsername)) {
      let response = await deleteStudentFromCourse(courseRequest, decodedToken.username);
      response.json({
        statusCode: 200,
        message: response
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

async function teacherExists(username) {
  return await userModel.exists({
    username,
    isTeacher: true
  });
}

async function studentExists(username) {
  return await userModel.exists({
    username,
    isTeacher: false
  });
}

async function teacherCanCreateCourse(newCourseSchedule, teacherUsername) {
  let teacherCourses = await courseModel.find({ teacherUsername });
  if (teacherCourses.length) {
    for (let course of teacherCourses) {
      let schedule = course.schedule;
      if (conflictMatrix(schedule, newCourseSchedule)) return false;
    }
  }
  return true;
}

async function studentCanTakeCourse(courseInfo, studentUsername) {
  let courseToSignIn = await courseModel.find({
    name: courseInfo.name,
    teacherUsername: courseInfo.teacherUsername
  });
  let studentSchedule = await courseModel.find({
    "students.username": studentUsername
  });
  if (courseToSignIn.length && studentSchedule.length) {
    for (let course of studentSchedule) {
      let schedule = course.schedule;
      if (conflictMatrix(schedule, courseToSignIn[0])) return false;
    }
  }
  return true;
}

async function conflictMatrix(schedule, newCourseSchedule) {
  let scheduleFilter = schedule.filter(classHour => hoursInCommon(classHour, newCourseSchedule));
  return scheduleFilter;
}

function hoursInCommon(classHour, newCourseSchedule) {
  let sameHours = newCourseSchedule.filter(newCourseClassHour => classHour.day === newCourseClassHour.day);
  for (let courseClassHour of sameHours) {
    let courseHourArray = courseClassHour.day.split("-");
    let classHourArray = classHour.day.split("-");

    let courseStart = convertDate(courseHourArray[0]);
    let courseEnd = convertDate(courseClassHour[1]);

    let classStart = convertDate(classHourArray[0]);
    let classEnd = convertDate(classHourArray[1]);

    if (classStart <= courseStart && classStart <= courseEnd || classEnd <= courseStart && classEnd <= courseEnd) return true;
  }
  return false;
}

function convertDate(stringDate) {
  return new Date(`1/1/1111 ${stringDate}`);
}

async function addStudentToCourse(courseRequest, studentUsername) {
  let courseList = (await courseModel.find({
    name: courseRequest.name,
    teacherUsername: courseRequest.teacherUsername
  })).students;

  let studentFilter = courseList.filter(student => student === studentUsername);
  if (!studentFilter) {
    courseList.push(studentUsername);
    await courseModel.update({
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
  })).students;

  let studentFilter = courseList.filter(student => student === studentUsername);
  if (studentFilter) {
    courseList = courseList.filter(student => student !== studentUsername);
    await courseModel.update({
      name: courseRequest.name,
      teacherUsername: courseRequest.teacherUsername
    }, { students: courseList });
    return "student deleted from course";
  } else return "student does not signed up to this course";

}

module.exports = router;