import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, memoryServer: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    let uri = process.env.MONGODB_URI;

    cached.promise = (async () => {
      try {
        if (uri) {
          // Attempt to connect to provided URI (Atlas or local) with a 4s timeout
          const testOpts = { ...opts, serverSelectionTimeoutMS: 4000 };
          return await mongoose.connect(uri, testOpts);
        }
      } catch (err: any) {
        console.warn("⚠️ Direct MongoDB connection failed. Initializing development fallback...", err.message);
      }

      // Development fallback: If MONGODB_URI fails or is missing, use mongodb-memory-server
      try {
        console.log("🚀 Starting in-memory MongoDB for local development...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        cached.memoryServer = await MongoMemoryServer.create();
        const fallbackUri = cached.memoryServer.getUri();
        console.log("✅ In-memory MongoDB running at:", fallbackUri);
        return await mongoose.connect(fallbackUri, opts);
      } catch (memoryErr: any) {
        console.error("❌ Failed to start in-memory MongoDB:", memoryErr.message);
        throw new Error("Could not connect to MongoDB Atlas or local MongoDB instance.");
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
