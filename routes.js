let express = require("express");

let signup = require("./controllers/signup");

let router = express.Router();

router.use("/signup", signup);

router.get("/", (request, response) => {
  response.send({
    statusCode: 200,
    message: "Server is up!"
  });
});

module.exports = router;