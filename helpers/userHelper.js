let qrCode = require("qrcode");

let userModel = require("../models/user");

module.exports.teacherExists = async username => {
  return await userModel.exists({
    username,
    isTeacher: true
  });
}

module.exports.studentExists = async username => {
  return await userModel.exists({
    username,
    isTeacher: false
  });
}

module.exports.generateQRCode = async data => {
  try {
    return await qrCode.toDataURL(data);
  } catch (error) {
    console.log("error generating qr code", error);
    return false;
  }
};

module.exports.getUsernameEmail = async username => {
  return (await userModel.find({ username }, [ "email" ]))[0].email;
};