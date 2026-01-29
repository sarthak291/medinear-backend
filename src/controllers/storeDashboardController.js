const MedicalStore = require("../models/MedicalStore");
const Inventory = require("../models/Inventory");
const Reservation = require("../models/Reservation");

exports.getDashboard = async (req, res) => {
  try {
    const storeId = req.storeId;

    const store = await MedicalStore.findById(storeId).select(
      "storeName email phone isVerified"
    );

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const totalMedicines = await Inventory.countDocuments({
      storeId,
      isActive: true,
    });

    const activeReservations = await Reservation.countDocuments({
      storeId,
      status: "PENDING",
    });

    res.json({
      store,
      stats: {
        totalMedicines,
        activeReservations,
      },
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
