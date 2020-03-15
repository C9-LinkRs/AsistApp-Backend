let express = require("express");
let jsonWebToken = require("jsonwebtoken");

const courseModel = require("../models/course");
const userModel = require("../models/user");

let router = express.Router();

router.get("/", (request, response) => {
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
    let decodedToken = jsonWebToken.sign(accessToken, process.env.SECRET_KEY);

    if (!await courseExists(courseRequest.name, decodedToken.username) && await teacherExists(decodedToken.username)) {
      let newCourse = new courseModel({
        name: courseRequest.name,
        teacherUsername: decodedToken.username
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
      await courseModel.destroy({
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
    let decodedToken = json.verify(accessToken, process.env.SECRET_KEY);

    if (await studentExists(courseRequest.studentUsername) && await courseExists(courseRequest.name, decodedToken.username)) {
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

    if (await studentExists(courseRequest.studentUsername) && await courseExists(courseRequest.name, decodedToken.username)) {
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

async function addStudentToCourse(courseRequest, teacherUsername) {
  let courseList = (await courseModel.find({
    name: courseRequest.name,
    teacherUsername
  })).students;

  let studentFilter = courseList.filter(student => student === courseRequest.studentUsername);
  if (!studentFilter) {
    courseList.push(courseRequest.studentUsername);
    await courseModel.update({
      name: courseRequest.name,
      teacherUsername
    }, { students: courseList });
    return "student added to course";
  } else return "student is already signed";
}

async function deleteStudentFromCourse(courseRequest, teacherUsername) {
  let courseList = (await courseModel.find({
    name: courseRequest.name,
    teacherUsername
  })).students;

  let studentFilter = courseList.filter(student => student === courseRequest.studentUsername);
  if (studentFilter) {
    courseList = courseList.filter(student => student !== courseRequest.studentUsername);
    await courseModel.update({
      name: courseRequest.name,
      teacherUsername
    }, { students: courseList });
    return "student deleted from course";
  } else return "student does not signed this course";

}

module.exports = router;