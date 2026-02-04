const express = require("express");
const {
  searchMedicine,
  searchMedicineSuggestions,
  getNearbyStores
} = require("../controllers/searchController");

const router = express.Router();

router.get("/medicine", searchMedicine);
router.get("/suggest", searchMedicineSuggestions);
router.get("/nearby", getNearbyStores);

module.exports = router;
