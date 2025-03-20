import express from "express";
import {
  registerUser,
  loginUser,
  registerAdmin,
  loginAdmin,
  forgotPasswordUser,
  resetPasswordUser,
  forgotPasswordAdmin,
  resetPasswordAdmin
} from "../controllers/authController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/forgot-password", forgotPasswordUser);
router.put("/user/reset-password/:resetToken", resetPasswordUser);

// Admin routes
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.post("/admin/forgot-password", forgotPasswordAdmin);
router.put("/admin/reset-password/:resetToken", resetPasswordAdmin);

export default router;