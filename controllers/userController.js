let express = require("express");

const userModel = require("../models/user");

let router = express.Router();

router.get("/", (request, response) => {
  userModel.find((error, dbResponse) => {
    response.json(dbResponse);
  });
});

router.post("/create", (request, response) => {
  let userRequest = request.body;
  console.log("new user data", userRequest);
  if (validRequest(userRequest) && !userExists(userRequest)) {
    let newUser = new userModel({
      username: userRequest.username,
      password: userRequest.password,
      email: userRequest.email,
      isTeacher: userRequest.isTeacher.toString()
    });
    newUser.save((error, userModel) => {
      if (error) {
        console.log("error saving new user in db", error);
        response.json({
          statusCode: 500,
          message: error
        });
      } else {
        response.json({
          statusCode: 200,
          message: "user added successful"
        });
      }
    });
  } else if (userExists(userRequest)) {
    response.json({
      statusCode: 200,
      message: "user already exists"
    });
  } else {
    response.json({
      statusCode: 400,
      message: "bad request"
    });
  }
});

function validRequest(body) {
  return body && body.username && body.password && body.email;
}

function userExists(body) {
  return userModel.find({
    username: body.username,
    password: body.password,
    email: body.email
  }, (error, response) => {
    if (error) {
      console.log("error checking user existance", error);
      return true;
    } else return response.length;
  });
}

module.exports = router;