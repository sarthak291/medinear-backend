const Inventory = require("../models/Inventory");

exports.addInventoryItem = async (req, res) => {
  try {
    const storeId = req.storeId;
    const {
      medicineId,
      price,
      quantityAvailable,
      expiryDate,
    } = req.body;

    if (!medicineId || price == null || quantityAvailable == null) {
      return res
        .status(400)
        .json({ message: "Missing required fields" });
    }

    const item = await Inventory.create({
      storeId,
      medicineId,
      price,
      quantityAvailable,
      expiryDate,
    });

    res.status(201).json(item);
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

    const item = await Inventory.findOneAndUpdate(
      { _id: id, storeId },
      req.body,
      { new: true }
    );

    if (!item) {
      return res
        .status(404)
        .json({ message: "Inventory item not found" });
    }

    res.json(item);
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
