let express = require("express");
const qrCode = require("qrcode");

const userModel = require("../models/user");

let router = express.Router();

router.get("/", (request, response) => {
  userModel.find((error, dbResponse) => {
    response.json(dbResponse);
  });
});

router.post("/create", async (request, response) => {
  let userRequest = request.body;
  console.log("new user data", userRequest);
  try {
    if (validRequest(userRequest) && !await userExists(userRequest)) {
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

});

async function generateQRCode(data) {
  try {
    return await qrCode.toDataURL(data);
  } catch (error) {
    console.log("error generating qr code", error);
    return false;
  }
}

function validRequest(body) {
  return body && body.username && body.password && body.email;
}

async function userExists(body) {
  return await userModel.exists({
    username: body.username,
    password: body.password,
    email: body.email
  });
}

module.exports = router;