const express = require("express");
const {
  searchMedicine,
  searchMedicineSuggestions,
  getNearbyStores
} = require("../controllers/searchController");

const router = express.Router();

// 🔹 Medicine search (THIS WAS MISSING ❌)
router.get("/medicine", searchMedicine);

// 🔹 Autocomplete (optional but you already use it)
router.get("/suggest", searchMedicineSuggestions);
router.get("/nearby", getNearbyStores);

// 🔹 Nearby stores
router.get("/nearby", getNearbyStores);

module.exports = router;
