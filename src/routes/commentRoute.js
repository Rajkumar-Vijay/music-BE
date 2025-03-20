import express from "express";
import {
  addComment,
  deleteComment,
  getItemComments,
  updateComment
} from "../controllers/commentController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/:itemType/:itemId", getItemComments);

// Protected routes
router.use(protectUser);
router.post("/:itemType/:itemId", addComment);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

export default router;