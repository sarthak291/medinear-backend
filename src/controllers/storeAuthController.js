const MedicalStore = require("../models/MedicalStore");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.storeSignup = async (req, res) => {
  try {
    const body = req.body || {};

    const {
      storeName,
      email,
      password,
      phone,
      area,
      city,
      lat,
      lng,
    } = body;

    // 1️⃣ Basic validation
    if (!storeName || !email || !password || !phone || !area || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2️⃣ Images validation
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: "At least one image required" });
    }

    // 3️⃣ Check if store already exists
    const existingStore = await MedicalStore.findOne({ email });
    if (existingStore) {
      return res.status(400).json({ message: "Store already registered" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Extract image URLs from Cloudinary
    const images = req.files.map((file) => file.path);

    // 6️⃣ Create store
    const store = await MedicalStore.create({
      storeName,
      email,
      password: hashedPassword,
      phone,
      address: {
        area,
        city,
      },
      coordinates: {
        lat: Number(lat),
        lng: Number(lng),
      },
      images,
      isVerified: false,
    });

    // 7️⃣ Success response
    res.status(201).json({
      message: "Store registered successfully. Awaiting verification.",
      storeId: store._id,
    });
  } catch (err) {
    console.error("STORE SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.storeLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const store = await MedicalStore.findOne({ email });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const isMatch = await bcrypt.compare(password, store.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!store.isVerified) {
      return res.status(403).json({
        message: "Store not verified yet. Please wait for approval.",
      });
    }

    const token = jwt.sign(
      { storeId: store._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        email: store.email,
      },
    });
  } catch (err) {
    console.error("STORE LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

