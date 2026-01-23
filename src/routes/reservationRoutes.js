const express = require("express");
const router = express.Router();
const {
  createReservation,
  updateReservationStatus
} = require("../controllers/reservationController");

router.post("/buy-now", createReservation);
router.put("/update-status", updateReservationStatus);

module.exports = router;
