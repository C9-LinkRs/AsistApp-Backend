let express = require("express");

const userModel = require("../models/user");

let router = express.Router();

router.post("/", (request, response) => {
  response.json({
    statusCode: 200,
    request
  });
});

module.exports = router;