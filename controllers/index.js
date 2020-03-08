let express = require("express");

let router = express.Router();

router.use("/signup", require("./registration"));
router.get("/", (request, response) => {
  response.send({
    statusCode: 200,
    message: "Server is up!"
  });
});

module.exports = router;