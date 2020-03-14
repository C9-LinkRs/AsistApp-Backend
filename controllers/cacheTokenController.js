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
      jsonWebToken.verify(userRequest.refreshToken, process.env.SECRET_KEY);

      let newAccessToken = jsonWebToken.sign(userRequest.username, process.env.SECRET_KEY, { expiresIn: process.env.SECRET_KEY});
      response.json({
        statusCode: 200,
        accessToken: newAccessToken
      });
    } else {
      response.json({
        statusCode: 404,
        message: "refresh token not found"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "error refreshing token";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
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

module.exports = router;