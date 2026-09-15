import express from "express";
import {
  matchSingleJob,
  getRecommendedJobs,
  applyForJob,
  getUserApplications,
} from "../controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/evaluate/resume/:resumeId/job/:jobId", matchSingleJob);
router.get("/recommendations", getRecommendedJobs);
router.post("/apply", applyForJob);
router.get("/applications", getUserApplications);

export default router;
