let mongoose = require("mongoose");

const cacheTokenSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('CacheToken', cacheTokenSchema);