let mongoose = require("mongoose");

const server = "127.0.0.1:27017";
const database = "asistencias_un";

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect(`mongodb://${server}/${database}`).then(() => {
      console.log("MongoDB connection successful");
    }).catch(error => {
      console.log("MongoDB connection error", error);
    });
  }
}

module.exports = new Database();