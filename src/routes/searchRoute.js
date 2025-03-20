import express from "express";
import { search } from "../controllers/searchController.js";
import { optionalProtectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Optional protection to include user's private playlists in search results if logged in
router.get("/", optionalProtectUser, search);

export default router;