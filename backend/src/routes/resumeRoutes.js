import express from "express";
import {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  setPrimaryResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/", getResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);
router.put("/:id/primary", setPrimaryResume);

export default router;
