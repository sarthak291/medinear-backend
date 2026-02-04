import MedicalStore from "../models/MedicalStore.js";
import calculateDistance from "../utils/distance.js";
const Medicine = require("../models/Medicine");
const Inventory = require("../models/Inventory");
const MedicalStore = require("../models/MedicalStore");
const getDistanceKm = require("../utils/distance");
const stringSimilarity = require("string-similarity");

exports.searchMedicine = async (req, res) => {
  try {
    const { query, lat, lng, radius = 5 } = req.query;

    if (!query || !lat || !lng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Find medicine (case-insensitive)
    const medicine = await Medicine.findOne({
      name: { $regex: query, $options: "i" }
    });

    // ❌ If medicine NOT found → suggest closest match
    if (!medicine) {
      const allMedicines = await Medicine.find().select("name");
      const medicineNames = allMedicines.map(m => m.name);

      if (medicineNames.length > 0) {
        const match = stringSimilarity.findBestMatch(query, medicineNames);

        if (match.bestMatch.rating > 0.4) {
          return res.json({
            medicine: null,
            suggestion: match.bestMatch.target,
            results: []
          });
        }
      }

      return res.json({ results: [] });
    }

    // 2. Get inventory entries
    const inventoryList = await Inventory.find({
      medicineId: medicine._id,
      quantityAvailable: { $gt: 0 },
      isActive: true
    }).populate("storeId");

    // 3. Filter nearby stores
    const results = inventoryList
      .map(item => {
        const store = item.storeId;

        const distance = getDistanceKm(
          Number(lat),
          Number(lng),
          store.coordinates.lat,
          store.coordinates.lng
        );

        if (distance <= radius) {
          return {
                   storeId: store._id,            // ✅ needed for reservation
                  medicineId: item.medicineId,   // ✅ needed for reservation
                  storeName: store.storeName,
                  phone: store.phone,
                  area: store.address.area,
                  deliveryAvailable: store.deliveryAvailable,
                  price: item.price,
                  quantityAvailable: item.quantityAvailable,
                  distance: Number(distance.toFixed(2))
};
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.price - b.price);

    res.json({ medicine: medicine.name, results });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchMedicineSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await Medicine.find({
      name: { $regex: `^${q}`, $options: "i" }
    })
      .limit(5)
      .select("name -_id");

    res.json(suggestions.map(m => m.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
  
};

export const getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    // 🔹 Get only verified stores
    const stores = await MedicalStore.find({
      isVerified: true,
    }).select("storeName address coordinates images");

    const nearbyStores = stores
      .map((store) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          store.coordinates.lat,
          store.coordinates.lng
        );

        return {
          storeId: store._id,
          storeName: store.storeName,
          area: store.address.area,
          city: store.address.city,
          images: store.images,
          distance: Number(distance.toFixed(2)),
        };
      })
      .filter((store) => store.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    return res.json({
      results: nearbyStores,
    });
  } catch (error) {
    console.error("Nearby search error:", error);
    res.status(500).json({
      message: "Failed to fetch nearby medical stores",
    });
  }
};