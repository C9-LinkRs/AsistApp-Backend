let express = require("express");

let userModel = require("../models/user");

let router = express.Router();

router.post("/", (request, response) => {
  response.send(request);
});

module.exports = router;