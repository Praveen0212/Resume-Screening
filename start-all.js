import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================================");
console.log("  LAUNCHING AI RESUME SCREENING & JOB MATCHING SYSTEM");
console.log("==================================================================");

// 1. Launch AI NLP Service (FastAPI)
console.log("[Launcher] Starting Python FastAPI NLP Service (port 8000)...");
const aiProcess = spawn("python", ["run.py"], {
  cwd: path.join(__dirname, "ai_service"),
  stdio: "inherit",
  shell: true,
});

// 2. Launch Backend (Express)
console.log("[Launcher] Starting Node.js Express Backend (port 5000)...");
const backendProcess = spawn("npm", ["start"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

// 3. Launch Frontend (Vite)
console.log("[Launcher] Starting React + Vite Frontend (port 5173)...");
const frontendProcess = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  console.log("\n[Launcher] Shutting down services...");
  aiProcess.kill();
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
