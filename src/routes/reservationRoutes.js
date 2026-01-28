const express = require("express");
const router = express.Router();
const {
  createReservation,
  updateReservationStatus,
  getStoreReservations
} = require("../controllers/reservationController");

router.get("/store/:storeId", getStoreReservations);

router.post("/buy-now", createReservation);
router.put("/update-status", updateReservationStatus);

module.exports = router;
