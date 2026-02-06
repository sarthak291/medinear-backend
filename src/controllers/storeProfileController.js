const MedicalStore = require("../models/MedicalStore");
const cloudinary = require("../config/cloudinary");

exports.getStoreProfile = async (req, res) => {
  try {
    const storeId = req.storeId;

    const store = await MedicalStore.findById(storeId).select(
      "storeName email phone address coordinates images isVerified googleMapLink"
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

    const { storeName, phone, area, city, lat, lng, googleMapLink } = req.body;

    const updateData = {};

    if (storeName) updateData.storeName = storeName;
    if (phone) updateData.phone = phone;

    if (area || city) {
      updateData.address = {
        area,
        city,
      };
    }

    // ✅ Only update coordinates if values are provided
    if (lat !== undefined && lng !== undefined && lat !== "" && lng !== "") {
      updateData.coordinates = {
        lat: Number(lat),
        lng: Number(lng),
      };
    }

    // ✅ Save google map link properly
    if (googleMapLink !== undefined) {
      updateData.googleMapLink = googleMapLink;
    }

    // If new images uploaded
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    const store = await MedicalStore.findByIdAndUpdate(storeId, updateData, {
      new: true,
    });

    res.json({
      message: "Profile updated successfully",
      store,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteStoreImage = async (req, res) => {
  try {
    const storeId = req.storeId;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    // 🔹 Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts.pop(); // abc123.jpg
    const folderPath = urlParts
      .slice(urlParts.indexOf("upload") + 2)
      .join("/");

    const publicId = `${folderPath}/${fileName.split(".")[0]}`;

    // 🔹 Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // 🔹 Remove from MongoDB
    await MedicalStore.findByIdAndUpdate(storeId, {
      $pull: { images: imageUrl },
    });

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("DELETE IMAGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
