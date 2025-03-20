// const express = require("express");
import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import path from "path";
import songRouter from "./src/routes/songRoute.js";
import albumRouter from "./src/routes/albumRoute.js";
import authRouter from "./src/routes/authRoute.js";
import playlistRouter from "./src/routes/playlistRoute.js";
import likeRouter from "./src/routes/likeRoute.js";
import commentRouter from "./src/routes/commentRoute.js";
import downloadRouter from "./src/routes/downloadRoute.js";
import searchRouter from "./src/routes/searchRoute.js";
import upload from "./src/middleware/multer.js";
import connectDB from "./src/config/mongodb.js";
import connectCloudinary from "./src/config/cloudinary.js";

// Create temp directory for file uploads if it doesn't exist
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  console.log(`Creating temp directory at ${tempDir}`);
  fs.mkdirSync(tempDir, { recursive: true });
}
const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();
// middlwares
app.use(express.json());
app.use(cors());
// initialising routes
console.log("Registering auth routes...");
app.use("/api/auth", authRouter);

console.log("Registering song routes...");
app.use("/api/song", songRouter);

console.log("Registering album routes...");
app.use("/api/album", albumRouter);

console.log("Registering playlist routes...");
app.use("/api/playlist", playlistRouter);

console.log("Registering like routes...");
app.use("/api/like", likeRouter);

console.log("Registering comment routes...");
app.use("/api/comment", commentRouter);

console.log("Registering download routes...");
app.use("/api/download", downloadRouter);

console.log("Registering search routes...");
app.use("/api/search", searchRouter);

// Log all registered routes
console.log("Registered routes:");
app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(r.route.stack[0].method.toUpperCase() + " " + r.route.path);
  } else if (r.name === "router") {
    r.handle.stack.forEach(function (layer) {
      if (layer.route) {
        const method = layer.route.stack[0].method.toUpperCase();
        const path = r.regexp.toString().split("\\")[1] + layer.route.path;
        console.log(method + " " + path);
      }
    });
  }
});

app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Add routes to test the album API
app.get("/api/test-album", (req, res) => {
  res.json({ message: "Album API is working" });
});

// Direct test route for album add
app.post("/api/direct-test-album-add", upload.single("image"), (req, res) => {
  console.log("Direct test album add route accessed");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  res.json({
    message: "Direct album add test route is working",
    receivedData: {
      body: req.body,
      file: req.file ? "File received" : "No file received",
    },
  });
});

// Catch-all route for debugging
app.use((req, res, next) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Not Found",
    message: `The requested URL ${req.originalUrl} was not found on this server.`,
    availableRoutes: "Check server logs for available routes",
  });
});

app.listen(port, () => console.log(`sever started on port ${port}`));
