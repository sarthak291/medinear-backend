const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalStore"
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine"
  },
  price: Number,
  quantityAvailable: Number,
  expiryDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);
