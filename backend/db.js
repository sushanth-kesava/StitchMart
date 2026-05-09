const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
  console.log("MongoDB Connected");
}

module.exports = connectDB;