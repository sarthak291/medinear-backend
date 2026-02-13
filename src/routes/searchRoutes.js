const express = require("express");

const {
  searchMedicine,
  searchMedicineSuggestions,
  getNearbyStores,
  searchCartMedicines,
  getNewestStores,
} = require("../controllers/searchController");

const router = express.Router();

router.post("/cart", searchCartMedicines);

// 🔹 Medicine search
router.get("/medicine", searchMedicine);

// 🔹 Autocomplete suggestions
router.get("/suggest", searchMedicineSuggestions);

// 🔹 Nearby medical stores
router.get("/nearby", getNearbyStores);

// ✅ Newest stores
router.get("/newest-stores", getNewestStores);

module.exports = router;
