const MedicalStore = require("../models/MedicalStore");
const Medicine = require("../models/Medicine");
const Inventory = require("../models/Inventory");
const getDistanceKm = require("../utils/distance");
const stringSimilarity = require("string-similarity");

/* ================= SEARCH MEDICINE ================= */
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

    // If medicine not found → suggest closest match
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

    // 2. Get inventory
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
            storeId: store._id,
            medicineId: item.medicineId,
            storeName: store.storeName,
            phone: store.phone,
            area: store.address.area,
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

/* ================= AUTOCOMPLETE ================= */
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

/* ================= NEARBY STORES ================= */
exports.getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    console.log("NEARBY API HIT:", lat, lng);

    if (!lat || !lng) {
      return res.status(400).json({ results: [] });
    }

    const stores = await MedicalStore.find({}); // 🔴 TEMP: no isVerified filter

    console.log("TOTAL STORES IN DB:", stores.length);

    const results = stores
      .map((store) => {
        if (!store.coordinates) return null;

        const distance = getDistanceKm(
          Number(lat),
          Number(lng),
          Number(store.coordinates.lat),
          Number(store.coordinates.lng)
        );

        if (distance <= radius) {
          return {
            storeId: store._id,
            storeName: store.storeName,
            area: store.address?.area || "",
            city: store.address?.city || "",
            distance: Number(distance.toFixed(2)),
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log("NEARBY RESULTS:", results.length);

    res.json({ results });
  } catch (err) {
    console.error("NEARBY ERROR:", err);
    res.status(500).json({ results: [] });
  }
};