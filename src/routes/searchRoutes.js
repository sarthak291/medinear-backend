const express = require("express");
const router = express.Router();

const {
  searchMedicine,
  searchMedicineSuggestions
} = require("../controllers/searchController");

router.get("/medicine", searchMedicine);
router.get("/suggest", searchMedicineSuggestions);

module.exports = router;
