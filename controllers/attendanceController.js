let express = require("express");
let jsonWebToken = require("jsonwebtoken");
let mongoose = require("mongoose");

let courseModel = require("../models/course");

const userHelper = require("../helpers/userHelper");
const courseHelper = require("../helpers/courseHelper");
const attendanceHelper = require("../helpers/attendanceHelper");

let router = express.Router();

router.get("/", async (request, response) => {
  response.json({
    statusCode: 200,
    message: "attendance controller is up!"
  });
});


router.post("/check", async (request, response) => {
  let accessToken = request.headers.authorization;
  let attRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    if (await userHelper.studentExists(decodedToken.username)) { // If student checks list from reading QR code from web
      let checkResponse = await checkStudent(decodedToken.username, attRequest);
      response.json({
        statusCode: checkResponse.statusCode,
        message: checkResponse.message,
        isLate: checkResponse.isLate
      });
    } else if (await userHelper.teacherExists(decodedToken.username)) { // If teacher checks list from reading students QR code from them phones
      if (await userHelper.studentExists(attRequest.studentUsername)) {
        let checkResponse = await checkStudent(attRequest.studentUsername, attRequest);
        response.json({
          statusCode: checkResponse.statusCode,
          message: checkResponse.message,
          isLate: checkResponse.isLate
        });
      } else {
        response.json({
          statusCode: 404,
          message: "student not found"
        });
      }
    } else {
      response.json({
        statusCode: 404,
        message: "user not found"
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

router.get("/link", async (request, response) => {

});

async function checkStudent(username, attRequest) {
  if (await courseHelper.courseExists(attRequest.courseId)) {
    if (!await attendanceHelper.studentChecked(username, attRequest)) {
      let course = await courseModel.find({ _id: mongoose.Types.ObjectId(attRequest.courseId) });
      if (attendanceHelper.validSemesterDay(attRequest.date, course[0])) {
        let courseHours = attendanceHelper.getClassHours(attRequest.date, course[0].schedule);
        if (courseHours) {
          if (attendanceHelper.validHour(attRequest.hours, courseHours)) {
            let attendanceList = course[0].attendanceList;
            let isLate = attendanceHelper.isLate(attRequest.hours, courseHours);
            attendanceList.push({
              username,
              date: attRequest.date,
              isLate
            });
            await courseModel.updateOne({
              _id: mongoose.Types.ObjectId(attRequest.courseId)
            }, { attendanceList: attendanceList });
            return {
              statusCode: 200,
              message: "student checked",
              isLate
            };
          } else {
            return {
              statusCode: 400,
              message: "hour is not between class length"
            };
          }
        } else {
          return {
            statusCode: 400,
            message: "course does not have class on requested day"
          };
        }
      } else {
        return {
          statusCode: 400,
          message: "date is not between course length"
        };
      }
    } else {
      return {
        statusCode: 200,
        message: "student is already checked"
      };
    }
  } else {
    return {
      statusCode: 404,
      message: "course not found"
    };
  }
}

module.exports = router;