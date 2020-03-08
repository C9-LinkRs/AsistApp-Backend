let mongoose = require("mongoose");

const {
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_SERVER,
  MONGODB_DATABASE
} = process.env;

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect(`mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${MONGODB_DATABASE}`).then(() => {
      console.log("MongoDB connection successful");
    }).catch(error => {
      console.log("MongoDB connection error", error);
    });
  }
}

module.exports = new Database();