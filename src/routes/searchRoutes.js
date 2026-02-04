const express = require("express");
const router = express.Router();

import {
  searchMedicine,
  getNearbyStores,
} from "../controllers/searchController.js";

const {
  searchMedicine,
  searchMedicineSuggestions
} = require("../controllers/searchController");

router.get("/medicine", searchMedicine);
router.get("/nearby", getNearbyStores);
router.get("/suggest", searchMedicineSuggestions);

module.exports = router;
