let express = require("express");
let mongoose = require("mongoose");

const courseModel = require("../models/course");
const userModel = require("../models/user");

let router = express.Router();

router.get("/", (request, response) => {
  courseModel.find((error, dbResponse) => {
    response.json(dbResponse);
  });
});

router.post("/create", async (request, response) => {
  let courseRequest = request.body;
  console.log("new course data", courseRequest);
  try {
    if (validRequest(courseRequest) && !await courseExists(courseRequest) && await teacherExists(courseRequest.teacherId)) {
      let newCourse = new courseModel({
        name: courseRequest.name,
        teacherId: courseRequest.teacherId
      });
      await newCourse.save();
      response.json({
        statusCode: 200,
        message: "course added successful"
      });
    } else if (courseExists(courseRequest)) {
      response.json({
        statusCode: 200,
        message: "course already exists"
      });
    } else {
      response.json({
        statusCode: 400,
        message: "bad request - empty fields"
      });
    }
  } catch (error) {
    console.log(error);
    response.json({
      statusCode: 500,
      message: "internal server error"
    });
  }
});

function validRequest(body) {
  try {
    mongoose.Types.ObjectId(body.teacherId);
    return body && body.name;
  } catch (error) {
    console.log("error validating request to create a course", error);
    return false;
  }
}

async function courseExists(body) {
  return await courseModel.exists({
    name: body.name, teacherId: body.teacherId
  });
}

async function teacherExists(teacherId) {
  return await userModel.exists({
    _id: mongoose.Types.ObjectId(teacherId),
    isTeacher: true
  });
}

module.exports = router;