import { MongoClient } from "mongodb";
const uri = "mongodb://localhost:27017";
let db: MongoClient;
const dbConnect = async (): Promise<MongoClient> => {
  try {
    if (db) {
      return db;
    }
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    db = client;
    console.log("Connected to db");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error;
  }
};
export default dbConnect;
