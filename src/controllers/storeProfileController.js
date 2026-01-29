const MedicalStore = require("../models/MedicalStore");

exports.getStoreProfile = async (req, res) => {
  try {
    const storeId = req.storeId;

    const store = await MedicalStore.findById(storeId).select(
      "storeName email phone address coordinates images isVerified"
    );

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json(store);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStoreProfile = async (req, res) => {
  try {
    const storeId = req.storeId;
    const { storeName, phone, area, city, lat, lng } = req.body;

    const updateData = {
      storeName,
      phone,
      address: {
        area,
        city,
      },
      coordinates: {
        lat: Number(lat),
        lng: Number(lng),
      },
    };

    // If new images uploaded
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    const store = await MedicalStore.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      store,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
