let mongoose = require("mongoose");

const cacheTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('CacheToken', cacheTokenSchema);