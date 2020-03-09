let express = require("express");

const userModel = require("../models/user");

let router = express.Router();

router.post("/", (request, response) => {
  console.log(request)
  response.json({
    statusCode: 200,
    request: 'hola'
  });
});

module.exports = router;