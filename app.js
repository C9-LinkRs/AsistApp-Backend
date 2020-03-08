let express = require("express");
const bodyParser = require("body-parser");

let app = express();
let router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(require("./middlewares/authorization"));
app.use(require("./controllers"));

app.listen(3000, () => {
  console.log('Server is up and listeting on port 3000');
});