const mongoose = require("mongoose");

const medicalStoreSchema = new mongoose.Schema({
  storeName: String,
  ownerName: String,
  phone: String,
  address: {
    city: String,
    area: String,
    fullAddress: String
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  deliveryAvailable: Boolean,
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("MedicalStore", medicalStoreSchema);
