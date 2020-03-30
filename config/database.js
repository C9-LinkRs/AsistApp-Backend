let mongoose = require("mongoose");

const {
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_SERVER,
  MONGODB_DATABASE,
  MONGODB_PORT
} = process.env;
const OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000
};
const URL = "mongodb://localhost/asistencias-un-prod";

mongoose.connect(URL, OPTIONS).then(() => {
  console.log("MongoDB connection successful");
}).catch(error => {
  console.log("MongoDB connection error", error);
});

module.exports = mongoose;