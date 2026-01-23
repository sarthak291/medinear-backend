const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  saltComposition: String,
  category: String,
  prescriptionRequired: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Medicine", medicineSchema);
