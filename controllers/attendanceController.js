let express = require("express");
let jsonWebToken = require("jsonwebtoken");

let courseModel = require("../models/course");
let userModel = require("../models/user");
let attendanceModel = require("../models/attendance");

let router = express.Router();

router.get("/", async (request, response) => {
  try {
    let dbResponse = await attendanceModel.find();

    response.json({
      statusCode,
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