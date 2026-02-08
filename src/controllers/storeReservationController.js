const Reservation = require("../models/Reservation");

exports.getStoreReservations = async (req, res) => {
  try {
    const storeId = req.storeId;

    const reservations = await Reservation.find({ storeId })
      .populate("medicines.medicineId", "name")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (err) {
    console.error("STORE RESERVATIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
