const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalStore",
      required: true,
    },

    medicines: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    status: {
      type: String,
      enum: ["PENDING", "VISITED", "NO_SHOW"],
      default: "PENDING",
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
