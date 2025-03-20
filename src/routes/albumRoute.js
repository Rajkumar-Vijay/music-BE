import express from "express";
import {
  addAlbum,
  listAlbum,
  removeAlbum,
} from "../controllers/albumController.js";
import upload from "../middleware/multer.js";

const albumRouter = express.Router();

// Log when the album router is initialized
console.log("Album router initialized");

// Add a test route to verify the router is working
albumRouter.get("/test", (req, res) => {
  console.log("Album test route accessed");
  res.json({ message: "Album router is working" });
});

// Add debugging middleware for all album routes
albumRouter.use((req, res, next) => {
  console.log(`Album route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Add the album routes with debugging
albumRouter.post("/add", (req, res, next) => {
  console.log("Album add route accessed before multer");
  next();
}, upload.single("image"), (req, res, next) => {
  console.log("Album add route accessed after multer, file:", req.file);
  next();
}, addAlbum);

albumRouter.get("/list", listAlbum);
albumRouter.post("/remove/:id", removeAlbum);

// Error handling middleware
albumRouter.use((err, req, res, next) => {
  console.error("Album route error:", err.stack);
  res.status(500).json({ success: false, message: "Something broke in album processing!" });
});

export default albumRouter;
