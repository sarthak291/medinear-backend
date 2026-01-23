const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  userName: String,
  phone: String,
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalStore"
  },
  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine"
      },
      quantity: Number
    }
  ],
  status: {
    type: String,
    enum: ["PENDING", "VISITED", "NO_SHOW"],
    default: "PENDING"
  },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);
