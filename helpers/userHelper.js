let userModel = require("../models/user");

module.exports.teacherExists = async (username) => {
  return await userModel.exists({
    username,
    isTeacher: true
  });
}

module.exports.studentExists = async (username) => {
  return await userModel.exists({
    username,
    isTeacher: false
  });
}