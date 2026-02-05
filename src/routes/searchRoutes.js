const express = require("express");
const {
  searchMedicine,
  searchMedicineSuggestions,
  getNearbyStores,
} = require("../controllers/searchController");

const router = express.Router();

// 🔹 Medicine search
router.get("/medicine", searchMedicine);

// 🔹 Autocomplete suggestions
router.get("/suggest", searchMedicineSuggestions);

// 🔹 Nearby medical stores
router.get("/nearby", getNearbyStores);

module.exports = router;
