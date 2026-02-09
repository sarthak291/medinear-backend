const express = require("express");
const router = express.Router();

const {
  createReservation,
  updateReservationStatus,
  getStoreReservations,
  createCartReservation,
} = require("../controllers/reservationController");


// Buy now reservation
router.post("/buy-now", createReservation);

// Update reservation status
router.put("/update-status", updateReservationStatus);

// Store reservations
router.get("/store/:storeId", getStoreReservations);

router.post("/cart", createCartReservation);

module.exports = router;
