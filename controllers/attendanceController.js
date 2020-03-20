let express = require("express");
let jsonWebToken = require("jsonwebtoken");

let courseModel = require("../models/course");
let userModel = require("../models/user");
let attendanceModel = require("../models/attendance");

const userHelper = require("../helpers/userHelper");

let router = express.Router();

router.get("/", async (request, response) => {
  try {
    let dbResponse = await attendanceModel.find();

    response.json({
      statusCode: 200,
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


router.post("/check", async (request, response) => {
  let accessToken = request.headers.authorization;
  let attRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);
    if (true) {

    } else if (true) {

    } else {

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

module.exports = router;