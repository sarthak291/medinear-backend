const MedicalStore = require("../models/MedicalStore");
const Medicine = require("../models/Medicine");
const Inventory = require("../models/Inventory");
const getDistanceKm = require("../utils/distance");
const stringSimilarity = require("string-similarity");

/* ================= MEDICINE SEARCH ================= */
exports.searchMedicine = async (req, res) => {
  try {
    const { query, lat, lng, radius = 50 } = req.query;

    if (!query || !lat || !lng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedQuery = query.trim().toLowerCase();

    // 🔹 First attempt: regex match
    let medicine = await Medicine.findOne({
      name: { $regex: normalizedQuery, $options: "i" },
    });

    let suggestion = null;

    // 🔹 If medicine NOT found → suggest closest match
    if (!medicine) {
      const allMedicines = await Medicine.find().select("name");
      const medicineNames = allMedicines.map((m) => m.name.toLowerCase());

      if (medicineNames.length > 0) {
        const match = stringSimilarity.findBestMatch(
          normalizedQuery,
          medicineNames
        );

        if (match.bestMatch.rating > 0.2) {
          suggestion = match.bestMatch.target;

          medicine = await Medicine.findOne({
            name: { $regex: suggestion, $options: "i" },
          });
        }
      }

      if (!medicine) {
        return res.json({
          medicine: null,
          suggestion,
          results: [],
        });
      }
    }

    // 🔹 Get inventory entries
    const inventoryList = await Inventory.find({
      medicineId: medicine._id,
      quantityAvailable: { $gt: 0 },
      isActive: true,
    }).populate("storeId");

    // 🔹 Filter nearby stores
    const results = inventoryList
      .map((item) => {
        const store = item.storeId;

        if (
          !store ||
          !store.coordinates ||
          store.coordinates.lat == null ||
          store.coordinates.lng == null
        ) {
          return null;
        }

        const distance = getDistanceKm(
          Number(lat),
          Number(lng),
          Number(store.coordinates.lat),
          Number(store.coordinates.lng)
        );

        if (distance <= Number(radius)) {
          return {
            storeId: store._id,
            medicineId: item.medicineId,
            storeName: store.storeName,
            phone: store.phone,
            area: store.address?.area || "",
            deliveryAvailable: store.deliveryAvailable || false,
            price: item.price,
            quantityAvailable: item.quantityAvailable,
            distance: Number(distance.toFixed(2)),
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.price - b.price);

    return res.json({
      medicine: medicine.name,
      suggestion,
      results,
    });
  } catch (error) {
    console.error("Search medicine error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= AUTOCOMPLETE SUGGESTIONS ================= */
exports.searchMedicineSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await Medicine.find({
      name: { $regex: `^${q}`, $options: "i" },
    })
      .limit(5)
      .select("name -_id");

    return res.json(suggestions.map((m) => m.name));
  } catch (err) {
    console.error("Suggestion error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= NEARBY STORES ================= */
exports.getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const stores = await MedicalStore.find({ isVerified: true });

    const results = stores
      .map((store) => {
        if (
          !store.coordinates ||
          store.coordinates.lat == null ||
          store.coordinates.lng == null
        ) {
          return null;
        }

        const distance = getDistanceKm(
          Number(lat),
          Number(lng),
          Number(store.coordinates.lat),
          Number(store.coordinates.lng)
        );

        if (distance <= Number(radius)) {
          return {
            storeId: store._id,
            storeName: store.storeName,
            area: store.address?.area || "",
            city: store.address?.city || "",
            images: store.images || [],
            distance: Number(distance.toFixed(2)),
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);

    return res.json({ results });
  } catch (error) {
    console.error("Nearby search error:", error);
    return res.status(500).json({
      message: "Failed to fetch nearby medical stores",
    });
  }
};
