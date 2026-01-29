const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/upload", upload.array("images", 3), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  const imageUrls = req.files.map(file => file.path);
  res.json({ images: imageUrls });
});


module.exports = router;
