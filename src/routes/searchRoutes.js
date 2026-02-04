const express = require("express");
const { getNearbyStores } = require("../controllers/searchController");

const router = express.Router();

router.get("/nearby", getNearbyStores);

module.exports = router;
