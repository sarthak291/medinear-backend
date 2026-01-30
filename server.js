require("dotenv").config(); // 👈 MUST BE FIRST

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

connectDB(); // 👈 after dotenv

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MediNear API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const searchRoutes = require("./src/routes/searchRoutes");
app.use("/api/search", searchRoutes);


const reservationRoutes = require("./src/routes/reservationRoutes");
app.use("/api/reservations", reservationRoutes);

const testUploadRoutes = require("./src/routes/testUploadRoutes");
app.use("/api/test", testUploadRoutes);

const storeAuthRoutes = require("./src/routes/storeAuthRoutes");
app.use("/api/store", storeAuthRoutes);

const storeDashboardRoutes = require("./src/routes/storeDashboardRoutes");
app.use("/api/store", storeDashboardRoutes);

const storeProfileRoutes = require("./src/routes/storeProfileRoutes");
app.use("/api/store", storeProfileRoutes);

const inventoryRoutes = require("./src/routes/inventoryRoutes");
app.use("/api/store/inventory", inventoryRoutes);
