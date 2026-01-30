const Inventory = require("../models/Inventory");
const Medicine = require("../models/Medicine");

exports.addInventoryItem = async (req, res) => {
  try {
    const storeId = req.storeId;
    const {
      medicineName,
      price,
      quantityAvailable,
      expiryDate,
    } = req.body;

    if (!medicineName || price == null || quantityAvailable == null) {
      return res
        .status(400)
        .json({ message: "Missing required fields" });
    }

    // 1️⃣ Find or create medicine
    let medicine = await Medicine.findOne({
      name: medicineName.toLowerCase(),
    });

    if (!medicine) {
      medicine = await Medicine.create({
        name: medicineName.toLowerCase(),
      });
    }

    // 2️⃣ Create inventory
    const inventory = await Inventory.create({
      storeId,
      medicineId: medicine._id,
      price,
      quantityAvailable,
      expiryDate,
    });

    res.status(201).json(inventory);
  } catch (err) {
    console.error("ADD INVENTORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getStoreInventory = async (req, res) => {
  try {
    const storeId = req.storeId;

    const inventory = await Inventory.find({ storeId })
      .populate("medicineId", "name")
      .sort({ createdAt: -1 });

    res.json(inventory);
  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const storeId = req.storeId;
    const { id } = req.params;
    const {
      medicineName,
      price,
      quantityAvailable,
      expiryDate,
    } = req.body;

    let updateData = {
      price,
      quantityAvailable,
      expiryDate,
    };

    // If medicine name changed → re-link medicine
    if (medicineName) {
      let medicine = await Medicine.findOne({
        name: medicineName.toLowerCase(),
      });

      if (!medicine) {
        medicine = await Medicine.create({
          name: medicineName.toLowerCase(),
        });
      }

      updateData.medicineId = medicine._id;
    }

    const updated = await Inventory.findOneAndUpdate(
      { _id: id, storeId },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Inventory item not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE INVENTORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.toggleInventoryStatus = async (req, res) => {
  try {
    const storeId = req.storeId;
    const { id } = req.params;

    const item = await Inventory.findOne({
      _id: id,
      storeId,
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Inventory item not found" });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.json(item);
  } catch (err) {
    console.error("TOGGLE INVENTORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
