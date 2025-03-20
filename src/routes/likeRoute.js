import express from "express";
import {
  likeItem,
  unlikeItem,
  getItemLikes,
  checkUserLike,
  getUserLikedSongs,
  getUserLikedPlaylists
} from "../controllers/likeController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/:itemType/:itemId", getItemLikes);

// Protected routes
router.use(protectUser);
router.post("/:itemType/:itemId", likeItem);
router.delete("/:itemType/:itemId", unlikeItem);
router.get("/check/:itemType/:itemId", checkUserLike);
router.get("/user/songs", getUserLikedSongs);
router.get("/user/playlists", getUserLikedPlaylists);

export default router;