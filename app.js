let express = require("express");
const bodyParser = require("body-parser");

const routes = require("./routes");
const mongodb = require("./config/database");

let app = express();

mongodb.connection.once('open', () => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use("/", routes);
  
  app.listen(process.env.NODEJS_PORT, () => {
    console.log(`Server is up and listeting on port ${process.env.NODEJS_PORT}`);
  });
});