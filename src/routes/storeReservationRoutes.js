const express = require("express");
const router = express.Router();
const storeAuth = require("../middleware/storeAuth");

const {
  getStoreReservations,
} = require("../controllers/storeReservationController");

// GET store reservations
router.get("/reservations", storeAuth, getStoreReservations);

module.exports = router;
