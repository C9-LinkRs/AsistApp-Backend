let express = require("express");

let teacherModel = require("../models/teacher");
let userModel = require("../models/user");

let router = express.Router();

router.post("/user/signup", (request, response) => {
  console.log(request);
});

router.post("/teacher/signup", (request, response) => {
  console.log(request);
});