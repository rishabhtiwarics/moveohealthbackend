import express from "express";
import {
  submitContact,
  getContacts,
  deleteContact,
  submitConsultation,
  getConsultations,
  deleteConsultation,
  submitCareer,
  getCareers,
  deleteCareer,
} from "../controllers/submissionController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

// Public Submissions
router.post("/contact", submitContact);
router.post("/consultation", submitConsultation);
router.post("/career", upload.single("resume"), submitCareer);

// Admin Protected Retrieval & Deletion
router.get("/contact", protectAdmin, getContacts);
router.delete("/contact/:id", protectAdmin, deleteContact);

router.get("/consultation", protectAdmin, getConsultations);
router.delete("/consultation/:id", protectAdmin, deleteConsultation);

router.get("/career", protectAdmin, getCareers);
router.delete("/career/:id", protectAdmin, deleteCareer);

export default router;
