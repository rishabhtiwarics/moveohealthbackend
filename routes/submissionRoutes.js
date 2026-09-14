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
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExts = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      return cb(null, true);
    }

    return cb(new Error("Only PDF, DOC, or DOCX files are allowed."));
  },
});

const handleUploadError = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File is too large. Please upload a resume up to 10MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to upload resume.",
    });
  });
};
const router = express.Router();

// Public Submissions
router.post("/contact", submitContact);
router.post("/consultation", submitConsultation);
router.post("/career", handleUploadError, submitCareer);

// Admin Protected Retrieval & Deletion
router.get("/contact", protectAdmin, getContacts);
router.delete("/contact/:id", protectAdmin, deleteContact);

router.get("/consultation", protectAdmin, getConsultations);
router.delete("/consultation/:id", protectAdmin, deleteConsultation);

router.get("/career", protectAdmin, getCareers);
router.delete("/career/:id", protectAdmin, deleteCareer);

export default router;
