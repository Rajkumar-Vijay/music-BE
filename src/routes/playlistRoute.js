import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPublicPlaylists
} from "../controllers/playlistController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicPlaylists);
router.get("/:id", getPlaylistById);

// Protected routes
router.use(protectUser);
router.post("/", upload.single("coverImage"), createPlaylist);
router.get("/", getUserPlaylists);
router.put("/:id", upload.single("coverImage"), updatePlaylist);
router.delete("/:id", deletePlaylist);
router.post("/:playlistId/songs/:songId", addSongToPlaylist);
router.delete("/:playlistId/songs/:songId", removeSongFromPlaylist);

export default router;