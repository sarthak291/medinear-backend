const express = require("express");
const router = express.Router();
const storeAuth = require("../middleware/storeAuth");
const {
  getDashboard,
} = require("../controllers/storeDashboardController");

router.get("/dashboard", storeAuth, getDashboard);

module.exports = router;
