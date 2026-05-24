import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

declare global {
  var mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const globalCache = global.mongooseConnection ?? {
  conn: null,
  promise: null
};

global.mongooseConnection = globalCache;

export async function connectToDatabase() {
  const uri = MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(uri, {
      bufferCommands: false
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
