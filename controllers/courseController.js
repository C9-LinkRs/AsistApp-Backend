let express = require("express");

const courseModel = require("../models/course");

let router = express.Router();

router.get("/", (request, response) => {
  courseModel.find((error, dbResponse) => {
    response.json(dbResponse);
  });
});

router.post("/create", (request, response) => {
  let courseRequest = request.body;
  console.log("new course data", courseRequest);
  if (validRequest(courseRequest) && !courseExists(courseRequest)) {
    let newCourse = new courseModel({
      name: courseRequest.name,
      teacherId: courseRequest.teacherId
    });
    newCourse.save((error, courseModel) => {
      if (error) {
        console.log("error saving new course in db", error);
        response.json({
          statusCode: 500,
          message: error
        });
      } else {
        response.json({
          statusCode: 200,
          message: "course added successful"
        });
      }
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
});

function validRequest(body) {
  return body && body.name && body.teacherId;
}

function courseExists(body) {
  return courseModel.find({
    name: body.name, teacherId: body.teacherId
  }, (error, response) => {
    if (error) {
      console.log("error checking course existance", error);
      return true;
    } else return response.length > 0;
  });
}

module.exports = router;