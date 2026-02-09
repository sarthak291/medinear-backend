const express = require("express");
const {
  searchMedicine,
  searchMedicineSuggestions,
  getNearbyStores,
  searchCartMedicines
} = require("../controllers/searchController");

const router = express.Router();


router.post("/cart", searchCartMedicines);

// 🔹 Medicine search
router.get("/medicine", searchMedicine);

// 🔹 Autocomplete suggestions
router.get("/suggest", searchMedicineSuggestions);

// 🔹 Nearby medical stores
router.get("/nearby", getNearbyStores);

module.exports = router;
