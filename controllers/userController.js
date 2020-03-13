let express = require("express");
let qrCode = require("qrcode");
let jsonWebToken = require("jsonwebtoken");

const userModel = require("../models/user");
const cacheTokenModel = require("../models/cacheToken");

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
  console.log("new user data", userRequest);
  try {
    if (validRequest(userRequest, true) && !await userExists(userRequest)) {
      let userData = userRequest.username + ';' + userRequest.password + ';' + userRequest.email;
      let userQrCode = await generateQRCode(userData);
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
    response.json({
      statusCode: 500,
      message: error
    });
  }
});

router.delete("/delete", (request, response) => {
  let accessToken = request.headers.authorization;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, process.env.SECRET_KEY);
    await userModel.destroy({ _id: decodedToken.userId });
    await cacheTokenModel.destroy({ userId });
    response.json({
      statusCode: 200,
      message: "user deleted"
    });
  } catch (error) {
    console.log(error);
    response.json({
      statusCode: 500,
      message: "error deleting user"
    });
  }
});

router.post("/login", async (request, response) => {
  let userRequest = request.body;
  try {
    if (validRequest(userRequest, false)) {
      let userData = await getUserInformation(userRequest);
      if (userData && userData.length) {
        let accessToken = jsonWebToken.sign({ userId: userData[0]._id }, process.env.SECRET_KEY, { expiresIn: process.env.TOKEN_LIFE });
        let refreshAccessRoken = jsonWebToken.sign({ userId: userData[0]._id }, process.env.SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_LIFE });
        let newRefreshToken = new cacheTokenModel({
          userId: userData[0]._id.toString(),
          refreshToken: refreshAccessRoken.toString()
        });
        await newRefreshToken.save();
        response.json({
          statusCode: 200,
          message: 'user logged in',
          accessToken
        });
      } else {
        response.json({
          statusCode: 400,
          message: 'user not found'
        });
      }
    }
  } catch (error) {
    console.log("error login user", error);
    response.json({
      statusCode: 500,
      message: "error login user"
    });
  }
});

router.get("/logout", async (request, response) => {
  let accessToken = request.headers.authorization;
  try {
    let decodedToken = jsonWebToken.verify(accessToken, proccess.env.SECRET_KEY, { ignoreExpiration: true });
    await cacheTokenModel.destroy({ userId: decodedToken.userId });
    response.json({
      statusCode: 200,
      message: "logged out"
    });
  } catch (error) {
    console.log(error);
    response.json({
      statusCode: 500,
      message: "error logging out"
    });
  }
});

async function generateQRCode(data) {
  try {
    return await qrCode.toDataURL(data);
  } catch (error) {
    console.log("error generating qr code", error);
    return false;
  }
}

function validRequest(body, isCreating) {
  return body && body.username && body.password && ((isCreating) ? body.email : true);
}

async function userExists(body) {
  return await userModel.exists({
    username: body.username,
    password: body.password,
    email: body.email
  });
}

async function getUserInformation(body) {
  return await userModel.find({
    username: body.username,
    password: body.password
  });
}

module.exports = router;