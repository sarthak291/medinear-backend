const mongoose = require("mongoose");

const MedicalStoreSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      city: String,
      area: String,
    },
    
    googleMapLink: {
    type: String,
    default: ""
    },

    coordinates: {
      lat: Number,
      lng: Number,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 3,
        message: "Upload 1 to 3 images",
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalStore", MedicalStoreSchema);
