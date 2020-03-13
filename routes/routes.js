let express = require("express");

const userController = require("../controllers/userController");
const courseController = require("../controllers/courseController");
const cacheTokenController = require("../controllers/cacheTokenController");

let router = express.Router();

router.use("/users", userController);
router.use("/courses", courseController);
router.use("/token", cacheTokenController);

router.get("/", (request, response) => {
  response.send({
    statusCode: 200,
    message: "Server is up!"
  });
});

module.exports = router;