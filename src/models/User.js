const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  role: {
    type: String,
    default: "USER"
  },
  location: {
    city: String,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
