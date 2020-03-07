let express = require("express");

let teacher_model = require("../models/teacher");
let student_model = require("../models/student");

let router = express.Router();

router.post("/user/signup", (request, response) => {
  console.log(request);
});

router.post("/teacher/signup", (request, response) => {
  console.log(request);
});