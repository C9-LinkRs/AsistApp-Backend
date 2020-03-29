let express = require("express");

const userController = require("../controllers/userController");
const courseController = require("../controllers/courseController");
const cacheTokenController = require("../controllers/cacheTokenController");
const attendanceController = require("../controllers/attendanceController");

let router = express.Router();

//API routes
router.use("/users", userController);
router.use("/courses", courseController);
router.use("/token", cacheTokenController);
router.use("/attendance", attendanceController);

//Server root route
router.get("/", (request, response) => {
  response.send({
    statusCode: 200,
    message: "Server is up!"
  });
});


module.exports = router;