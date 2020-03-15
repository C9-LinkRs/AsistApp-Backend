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
  let accessToken = request.headers.authorization;
  let userRequest = request.body;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY, { ignoreExpiration: true });

    if (await refreshExists(decodedToken.username, userRequest.refreshToken)) {
      jsonWebToken.verify(userRequest.refreshToken, process.env.SECRET_KEY);

      let newAccessToken = jsonWebToken.sign({ username: decodedToken.username }, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_LIFE});
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

async function refreshExists(username, refreshToken) {
  return await cacheTokenModel.exists({
    username,
    refreshToken
  });
}

module.exports = router;