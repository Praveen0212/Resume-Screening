import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static uploads folder
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// API Root Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "AI-Based Resume Screening & Job Matching Backend",
    version: "1.0.0",
  });
});

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server after connecting to DB
connectDB()
  .then(async () => {
    // Auto-seed initial sample data if database is empty
    try {
      const Job = (await import("./models/Job.js")).default;
      const jobCount = await Job.countDocuments();
      if (jobCount === 0) {
        console.log("[Server] Database is empty. Auto-seeding initial users and jobs...");
        const { seedDatabase } = await import("./seed/seedData.js");
        await seedDatabase(false);
      }
    } catch (err) {
      console.warn("[Server] Auto-seed check notice:", err.message);
    }

    app.listen(PORT, () => {
      console.log(`[Server] Express Backend running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[Server] Fatal: Database connection error:", err.message);
    process.exit(1);
  });

export default app;
