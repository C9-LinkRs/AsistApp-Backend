let express = require("express");

const courseModel = require("../models/course");

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
    if (validRequest(courseRequest) && !await courseExists(courseRequest)) {
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
    response.json({
      statusCode: 500,
      message: error
    });
  }
});

function validRequest(body) {
  return body && body.name && body.teacherId;
}

async function courseExists(body) {
  return await courseModel.exists({
    name: body.name, teacherId: body.teacherId
  });
}

module.exports = router;