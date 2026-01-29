const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  storeSignup,
  storeLogin,
} = require("../controllers/storeAuthController");

router.post("/signup", upload.array("images", 3), storeSignup);
router.post("/login", storeLogin);

module.exports = router;
