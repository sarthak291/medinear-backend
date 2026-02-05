const express = require("express");
const router = express.Router();

const {
  searchMedicine,
  searchMedicineSuggestions,
  getNearbyStores
} = require("../controllers/searchController");

router.get("/medicine", searchMedicine);
router.get("/suggest", searchMedicineSuggestions);
router.get("/nearby", getNearbyStores);

module.exports = router;
