let express = require("express");
let jsonWebToken = require("jsonwebtoken");
let mongoose = require("mongoose");

let courseModel = require("../models/course");
let userModel = require("../models/user");

const userHelper = require("../helpers/userHelper");
const courseHelper = require("../helpers/courseHelper");
const attendanceHelper = require("../helpers/attendanceHelper");

let router = express.Router();

router.get("/", async (request, response) => {
  try {
    let dbResponse = await attendanceModel.find();

    response.json({
      statusCode: 200,
      dbResponse
    });
  } catch (error) {
    console.log("error fetching all attendance lists", error);
    response.json({
      statusCode: 500,
      message: "error fetching data"
    });
  }
});


router.post("/check", async (request, response) => {
  let accessToken = request.headers.authorization;
  let attRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    if (await userHelper.studentExists(decodedToken.username)) {
      if (await courseHelper.courseExists(attRequest.courseId)) {
        if (!await attendanceHelper.studentChecked(decodedToken.username, attRequest.courseId)) {
          let course = await courseModel.find({ _id: mongoose.Types.ObjectId(attRequest.courseId) });
          console.log(course);
          let startDate = new Date(course[0].startDate);
          let endDate = new Date(course[0].endDate);
          let classDay = new Date(attRequest.date);
          if (startDate <= classDay && classDay <= endDate) {
            let courseSchedule = course[0].schedule;
            let classDayName = attendanceHelper.convertDay(classDay.getDay());
            console.log(classDayName);
            let courseClassDayFilter = courseSchedule.filter(courseClassDay => courseClassDay.day === classDayName);
            console.log(courseClassDayFilter);
            if (courseClassDayFilter.length) {
              let courseHours = courseClassDayFilter[0].hours;
              if (attendanceHelper.validHour(attRequest.date, courseHours)) {
                let attendedStudent = {
                  username: decodedToken.username,
                  date: attRequest.date,
                  isLate: attendanceHelper.isLate(attRequest.date, courseHours)
                };
                
                response.json({
                  statusCode: 200,
                  message: "student checked"
                });
              } else {
                response.json({
                  statusCode: 400,
                  message: "hour is not between class length"
                });
              }
            } else {
              response.json({
                statusCode: 400,
                message: "course does not have class on requested day"
              });
            }
          } else {
            response.json({
              statusCode: 400,
              message: "date is not between course length"
            });
          }
        } else {
          response.json({
            statusCode: 200,
            message: "student is already checked"
          });
        }
      } else {
        response.json({
          statusCode: 404,
          message: "course not found"
        });
      }
    } else if (await userHelper.teacherExists(decodedToken.username)) {

    } else {
      response.json({
        statusCode: 404,
        message: "user or teacher not found"
      })
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

router.get("/link", async (request, response) => {

});

module.exports = router;