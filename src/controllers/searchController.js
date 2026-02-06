const MedicalStore = require("../models/MedicalStore");
const Medicine = require("../models/Medicine");
const Inventory = require("../models/Inventory");
const getDistanceKm = require("../utils/distance");
const stringSimilarity = require("string-similarity");

// ✅ Escape regex special chars
const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/* ================= MEDICINE SEARCH ================= */
exports.searchMedicine = async (req, res) => {
  try {
    const { query, lat, lng, radius = 50 } = req.query;

    if (!query || !lat || !lng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedQuery = query.trim().toLowerCase();
    const safeQuery = escapeRegex(normalizedQuery);

    let suggestion = null;

    // 🔹 First attempt: exact match (best)
    let medicine = await Medicine.findOne({
      name: normalizedQuery,
    });

    // 🔹 Second attempt: partial match
    if (!medicine) {
      medicine = await Medicine.findOne({
        name: { $regex: safeQuery, $options: "i" },
      });
    }

    // 🔹 If medicine NOT found → suggest closest match
    if (!medicine) {
      const allMedicines = await Medicine.find().select("name");
      const medicineNames = allMedicines.map((m) => m.name.toLowerCase());

      if (medicineNames.length > 0) {
        const match = stringSimilarity.findBestMatch(
          normalizedQuery,
          medicineNames
        );

        if (match.bestMatch.rating > 0.25) {
          suggestion = match.bestMatch.target;

          medicine = await Medicine.findOne({
            name: suggestion,
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

    // 🔹 Get inventory entries + store details
    const inventoryList = await Inventory.find({
      medicineId: medicine._id,
      quantityAvailable: { $gt: 0 },
      isActive: true,
    }).populate("storeId", "storeName phone address coordinates isVerified images googleMapLink");

    // 🔹 Filter nearby verified stores
    const results = inventoryList
      .map((item) => {
        const store = item.storeId;

        if (!store || store.isVerified !== true) {
          return null;
        }

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

        if (distance > Number(radius)) return null;

        return {
          storeId: store._id,
          storeName: store.storeName,
          phone: store.phone,
          area: store.address?.area || "",
          city: store.address?.city || "",
          googleMapLink: store.googleMapLink || "",
          images: store.images || [],
          price: item.price,
          quantityAvailable: item.quantityAvailable,
          distance: Number(distance.toFixed(2)),
        };
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

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const safeQ = escapeRegex(q.trim().toLowerCase());

    const suggestions = await Medicine.find({
      name: { $regex: `^${safeQ}`, $options: "i" },
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

    const stores = await MedicalStore.find({ isVerified: true }).select(
      "storeName address coordinates images googleMapLink"
    );

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

        if (distance > Number(radius)) return null;

        return {
          storeId: store._id,
          storeName: store.storeName,
          area: store.address?.area || "",
          city: store.address?.city || "",
          googleMapLink: store.googleMapLink || "",
          images: store.images || [],
          distance: Number(distance.toFixed(2)),
        };
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
