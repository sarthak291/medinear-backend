require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Medicine = require("../models/Medicine");
const MedicalStore = require("../models/MedicalStore");
const Inventory = require("../models/Inventory");

const seedData = async () => {
  try {
    await connectDB();
    console.log("📦 Database connected for seeding");

    // Clear old data
    await Medicine.deleteMany();
    await MedicalStore.deleteMany();
    await Inventory.deleteMany();

    // 1. Medicines
    const medicines = await Medicine.insertMany([
      {
        name: "Paracetamol 650",
        saltComposition: "Paracetamol",
        category: "Tablet",
        prescriptionRequired: false
      },
      {
        name: "Azithromycin 500",
        saltComposition: "Azithromycin",
        category: "Tablet",
        prescriptionRequired: true
      }
    ]);

    // 2. Medical Stores
    const stores = await MedicalStore.insertMany([
      {
        storeName: "City Medical",
        ownerName: "Ramesh",
        phone: "9876543210",
        address: {
          city: "Pune",
          area: "Shivaji Nagar",
          fullAddress: "Shivaji Nagar, Pune"
        },
        coordinates: {
          lat: 18.5308,
          lng: 73.8475
        },
        deliveryAvailable: true,
        isVerified: true
      },
      {
        storeName: "HealthPlus Pharmacy",
        ownerName: "Suresh",
        phone: "9123456789",
        address: {
          city: "Pune",
          area: "FC Road",
          fullAddress: "FC Road, Pune"
        },
        coordinates: {
          lat: 18.5204,
          lng: 73.8567
        },
        deliveryAvailable: false,
        isVerified: true
      }
    ]);

    // 3. Inventory
    await Inventory.insertMany([
      {
        storeId: stores[0]._id,
        medicineId: medicines[0]._id,
        price: 32,
        quantityAvailable: 50,
        expiryDate: new Date("2026-01-01")
      },
      {
        storeId: stores[1]._id,
        medicineId: medicines[0]._id,
        price: 30,
        quantityAvailable: 20,
        expiryDate: new Date("2026-03-01")
      },
      {
        storeId: stores[1]._id,
        medicineId: medicines[1]._id,
        price: 110,
        quantityAvailable: 10,
        expiryDate: new Date("2025-12-01")
      }
    ]);

    console.log("✅ Sample data seeded successfully");
await mongoose.connection.close();
process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  }
};

seedData();
