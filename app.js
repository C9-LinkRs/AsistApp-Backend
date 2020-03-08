let express = require("express");
const bodyParser = require("body-parser");

const routes = require("./routes");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/", routes);

app.listen(3000, () => {
  console.log('Server is up and listeting on port 3000');
});