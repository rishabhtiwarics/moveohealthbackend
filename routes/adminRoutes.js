import express from "express";
import {
  loginAdmin,
  forgotPassword,
  resetPassword,
  getAdminProfile,
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protectAdmin, getAdminProfile);

export default router;
