let express = require("express");
let jsonWebToken = require("jsonwebtoken");

const cacheTokenModel = require("../models/cacheToken");
let router = express.Router();


router.get("/", async (request, response) => {
  try {
    let dbResponse = await cacheTokenModel.find();

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

router.post("/refresh", async (request, response) => {
  let userRequest = request.body;
  try {
    if (await refreshExists(userRequest)) {
      let userId = await getUserId(userRequest);

      jsonWebToken.verify(userRequest.refreshToken, process.env.SECRET_KEY); // Check if refresh token is alive

      let newAccessToken = jsonWebToken.sign(userId, process.env.SECRET_KEY, { expiresIn: process.env.SECRET_KEY});
      response.json({
        statusCode: 200,
        accessToken: newAccessToken
      });
    } else {
      response.json({
        statusCode: 403,
        message: "refresh token not found"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "error refreshing token";
    response.json({
      statusCode: 500,
      message
    });
  }
});

async function refreshExists(body) {
  return await cacheTokenModel.exists({
    username: body.username,
    refreshToken: body.refreshToken
  });
}

async function getUserId(body) {
  return (await userModel.find({
    username: body.username,
    password: body.password
  }))._id;
}

module.exports = router;