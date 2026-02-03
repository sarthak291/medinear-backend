const express = require("express");
const router = express.Router();
const MedicalStore = require("../models/MedicalStore");

// 🔐 Admin login (password check)
router.post("/login", (req, res) => {
  if (req.body.password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin password" });
  }
  res.json({ success: true });
});

// 📋 Get unverified stores
router.get("/stores/pending", async (req, res) => {
  const stores = await MedicalStore.find({ isVerified: false });
  res.json(stores);
});

// ✅ Verify store
router.patch("/store/:id/verify", async (req, res) => {
  await MedicalStore.findByIdAndUpdate(req.params.id, {
    isVerified: true,
  });
  res.json({ success: true });
});

module.exports = router;
