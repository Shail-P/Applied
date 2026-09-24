import "server-only";
import { MongoClient } from "mongodb";

const shared = globalThis as typeof globalThis & { mongoClient?: MongoClient };

export function getDatabase() {
  const uri = process.env.MONGODB_URI;
  const name = process.env.MONGODB_DB;
  if (!uri || !name) throw new Error("MongoDB configuration is missing.");
  shared.mongoClient ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  return shared.mongoClient.db(name);
}
