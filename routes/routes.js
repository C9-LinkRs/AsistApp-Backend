let express = require("express");

const userController = require("../controllers/userController");
const courseController = require("../controllers/courseController");

let router = express.Router();

router.use("/users", userController);
router.use("/courses", courseController);

router.get("/", (request, response) => {
  response.send({
    statusCode: 200,
    message: "Server is up!"
  });
});

module.exports = router;