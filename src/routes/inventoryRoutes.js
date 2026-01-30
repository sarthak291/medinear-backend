const express = require("express");
const router = express.Router();
const storeAuth = require("../middleware/storeAuth");

const {
  addInventoryItem,
  getStoreInventory,
  updateInventoryItem,
  toggleInventoryStatus,
} = require("../controllers/inventoryController");

router.post("/", storeAuth, addInventoryItem);
router.get("/", storeAuth, getStoreInventory);
router.put("/:id", storeAuth, updateInventoryItem);
router.patch("/:id", storeAuth, toggleInventoryStatus);

module.exports = router;
