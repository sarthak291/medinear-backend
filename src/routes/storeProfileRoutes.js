const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const storeAuth = require("../middleware/storeAuth");

const {
  getStoreProfile,
  updateStoreProfile,
} = require("../controllers/storeProfileController");

router.get("/profile", storeAuth, getStoreProfile);

router.put(
  "/profile",
  storeAuth,
  upload.array("images", 3),
  updateStoreProfile
);

module.exports = router;
