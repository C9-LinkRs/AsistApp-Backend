let express = require("express");
let jsonWebToken = require("jsonwebtoken");

const cacheTokenModel = require("../models/cacheToken");
const userModel = require("../models/user");

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

router.get("/refresh", async (request, response) => {
  let accessToken = request.headers.authorization;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY, { ignoreExpiration: true });
    let userId = decodedToken.userId;
    if (await userExists(userId) && await refreshExists(userId)) {
      let dbResponse = await getRefreshToken(userId);
      let refreshToken = dbResponse.refreshToken;

      jsonWebToken.verify(refreshToken, process.env.SECRET_KEY); // Check if refresh token is alive
      
      let newToken = jsonWebToken.sign(userId, process.env.SECRET_KEY);
      response.json({
        statusCode: 200,
        accessToken: newToken
      });
    } else if(await userExists(userId)) {
      response.json({
        statusCode: 403,
        message: "expired refresh token"
      });
    } else {
      response.json({
        statusCode: 400,
        message: "bad request"
      });
    }
  } catch (error) {
    console.log(error);
    response.json({
      statusCode: 500,
      message: error.message
    });
  }
});

async function userExists(userId) {
  return await userModel.exists({ _id: userId });
}

async function refreshExists(userId) {
  return await cacheTokenModel.exists({ userId });
}

async function getRefreshToken(userId) {
  return await cacheTokenModel.find({ userId });
}

module.exports = router;