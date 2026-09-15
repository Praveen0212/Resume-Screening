import mongoose from "mongoose";

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/resume_screening";

  try {
    // Attempt connecting with a short 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Initializing embedded in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB at: ${memUri}`);
      console.log(`[Database] Note: In-memory mode active. Data persists for this process run.`);
    } catch (memErr) {
      console.error("[Database] Critical: Could not start MongoDB or In-Memory fallback:", memErr.message);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
