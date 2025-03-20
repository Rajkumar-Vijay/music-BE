import express from "express";
import {
  downloadSong,
  getUserDownloads
} from "../controllers/downloadController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(protectUser);
router.get("/song/:songId", downloadSong);
router.get("/user", getUserDownloads);

export default router;