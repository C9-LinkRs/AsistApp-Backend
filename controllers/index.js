let express = require("express");

let router = express.Router();

router.use("/signup", require("./registration"));

module.exports = router;