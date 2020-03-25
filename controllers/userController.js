let express = require("express");
let jsonWebToken = require("jsonwebtoken");

const userModel = require("../models/user");
const cacheTokenModel = require("../models/cacheToken");

const userHelper = require("../helpers/userHelper");

let router = express.Router();

router.get("/", async (request, response) => {
  try {
    const dbResponse = await userModel.find();

    response.json({
      statusCode: 200,
      dbResponse
    });
  } catch (error) {
    response.json({
      statusCode: 500,
      message: "error fetching data"
    });
  }

});

router.post("/create", async (request, response) => {
  let userRequest = request.body;
  try {
    if (validRequest(userRequest, true) && !await userExists(userRequest)) {
      let userData = userRequest.username + ';' + userRequest.password + ';' + userRequest.email;
      let userQrCode = await userHelper.generateQRCode(userData);
      let newUser = new userModel({
        username: userRequest.username,
        password: userRequest.password,
        email: userRequest.email,
        isTeacher: userRequest.isTeacher.toString(),
        qrCode: userQrCode.toString()
      });
      await newUser.save();
      response.json({
        statusCode: 200,
        message: "user added successful"
      });
    } else if (await userExists(userRequest)) {
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
  } catch (error) {
    console.log(error);
    response.json({
      statusCode: 500,
      message: "error creating user"
    });
  }
});

router.delete("/delete", async (request, response) => {
  let accessToken = request.headers.authorization;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    await userModel.findOneAndDelete({ username: decodedToken.username });
    await cacheTokenModel.findOneAndDelete({ username: decodedToken.username });
    response.json({
      statusCode: 200,
      message: "user deleted"
    });
  } catch (error) {
    console.log(error);
    let message = error.message || "error deleting user";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

router.post("/login", async (request, response) => {
  let userRequest = request.body;
  try {
    if (validRequest(userRequest, false)) {
      if (await userExists(userRequest)) {
        let accessToken = jsonWebToken.sign({ username: userRequest.username }, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_LIFE });
        let refreshToken = await getRefreshToken(userRequest);

        if (!refreshToken) {
          refreshToken = jsonWebToken.sign({ username: userRequest.username }, process.env.SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_LIFE });
          let newRefreshToken = new cacheTokenModel({
            username: userRequest.username.toString(),
            refreshToken: refreshToken.toString()
          });
          await newRefreshToken.save();
        }
        response.json({
          statusCode: 200,
          accessToken,
          refreshToken
        });
      } else {
        response.json({
          statusCode: 404,
          message: "user not found"
        });
      }
    } else {
      response.json({
        statusCode: 400,
        message: "bad request"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "error loging user";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

router.get("/logout", async (request, response) => {
  let accessToken = request.headers.authorization;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY, { ignoreExpiration: true });

    await cacheTokenModel.findOneAndDelete({ username: decodedToken.username });
    response.json({
      statusCode: 200,
      message: "logged out"
    });
  } catch (error) {
    console.log(error);
    let message = error.message || "error logging out";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

router.get("/info", async (request, response) => {
  let accessToken = request.headers.authorization;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);

    if (await userExists({ username: decodedToken.username })) {
      let dbResponse = (await userModel.find({ username: decodedToken.username }))[0];
      let userInfo = {
        username: dbResponse.username,
        email: dbResponse.email,
        isTeacher: dbResponse.isTeacher,
        qrCode: dbResponse.qrCode
      };
      response.json({
        statusCode: 200,
        userInfo
      });
    } else {
      response.json({
        statusCode: 404,
        message: "user not found"
      });
    }
  } catch (error) {
    console.log(error);
    let message = error.message || "internal server error";
    let statusCode = (error.message === "jwt expired") ? 401 : 500;
    response.json({
      statusCode,
      message
    });
  }
});

function validRequest(body, isCreating) {
  return body && body.username && body.password && ((isCreating) ? body.email : true);
}

async function userExists(body) {
  return await userModel.exists({
    $or: [
      { username: body.username },
      { email: body.email }
    ]
  });
}

async function getRefreshToken(body) {
  try {
    let dbResponse = await cacheTokenModel.find({ username: body.username });
    if (dbResponse.length) {
      jsonWebToken.verify(dbResponse[0].refreshToken, process.env.SECRET_KEY);

      return dbResponse[0].refreshToken;
    } else return undefined;
  } catch (error) {
    console.log(error);
    console.log("deleting refresh token from db if exists");
    await cacheTokenModel.findOneAndDelete({ username: body.username });
    return undefined;
  }
}

module.exports = router;