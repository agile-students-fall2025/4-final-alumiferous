#!/usr/bin/env node

import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/alumiferous_test";

async function start() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Start HTTP server
    const listener = app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });

    const close = () => {
      listener.close();
      mongoose.connection.close();
    };

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
