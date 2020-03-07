let express = require("express");

let teacherModel = require("../models/teacher");
let studentModel = require("../models/student");

let router = express.Router();

router.post("/user/signup", (request, response) => {
  console.log(request);
});

router.post("/teacher/signup", (request, response) => {
  console.log(request);
});