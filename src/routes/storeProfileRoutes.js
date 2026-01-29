const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const storeAuth = require("../middleware/storeAuth");

const {
  getStoreProfile,
  updateStoreProfile,
  deleteStoreImage,
} = require("../controllers/storeProfileController");

// Get store profile
router.get("/profile", storeAuth, getStoreProfile);

// Update store profile (with optional images)
router.put(
  "/profile",
  storeAuth,
  upload.array("images", 3),
  updateStoreProfile
);

// Delete single store image (Cloudinary + DB)
router.delete(
  "/profile/image",
  storeAuth,
  deleteStoreImage
);

module.exports = router;
