const Reservation = require("../models/Reservation");
const Inventory = require("../models/Inventory");

exports.createReservation = async (req, res) => {
  try {
    const { userName, phone, storeId, medicines } = req.body;

    if (!userName || !phone || !storeId || !medicines?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate medicineId exists
    for (let med of medicines) {
      if (!med.medicineId) {
        return res.status(400).json({ message: "medicineId missing in medicines array" });
      }
    }

    const reservation = await Reservation.create({
      userName,
      phone,
      storeId,
      medicines: medicines.map((m) => ({
        medicineId: m.medicineId,
        quantity: m.quantity || 1,
      })),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    });

    res.status(201).json({
      message: "Reservation created successfully",
      reservationId: reservation._id,
    });
  } catch (error) {
    console.error("CREATE RESERVATION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateReservationStatus = async (req, res) => {
  try {
    const { reservationId, status } = req.body;

    if (!reservationId || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["VISITED", "NO_SHOW"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = status;
    await reservation.save();

    res.json({
      message: `Reservation marked as ${status}`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getStoreReservations = async (req, res) => {
  try {
    const storeId = req.storeId;

    const reservations = await Reservation.find({ storeId })
      .sort({ createdAt: -1 })
      .populate("medicines.medicineId", "name");

    res.json(reservations);
  } catch (err) {
    console.error("STORE RESERVATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const Medicine = require("../models/Medicine");

exports.createCartReservation = async (req, res) => {
  try {
    const { userName, phone, storeId, medicines } = req.body;

    if (!userName || !phone || !storeId || !medicines?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔹 Convert medicineName to medicineId
    const medicineDocs = await Medicine.find({
      name: { $in: medicines.map((m) => new RegExp(`^${m.medicineName}$`, "i")) },
    });

    if (medicineDocs.length === 0) {
      return res.status(400).json({ message: "Medicines not found" });
    }

    const medicineMap = {};
    medicineDocs.forEach((m) => {
      medicineMap[m.name.toLowerCase()] = m._id;
    });

    const formattedMedicines = medicines.map((m) => ({
      medicineId: medicineMap[m.medicineName.toLowerCase()],
      quantity: m.quantity || 1,
    }));

    // 🔹 Validate all ids exist
    for (let med of formattedMedicines) {
      if (!med.medicineId) {
        return res.status(400).json({
          message: "Some medicine not found in database",
        });
      }
    }

    // 🔹 Create reservation
    const reservation = await Reservation.create({
      userName,
      phone,
      storeId,
      medicines: formattedMedicines,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });

    res.status(201).json({
      message: "Cart reservation created successfully",
      reservationId: reservation._id,
    });
  } catch (err) {
    console.error("CART RESERVATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
