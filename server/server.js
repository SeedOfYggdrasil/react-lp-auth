// server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");

// Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database
const mongoUri = process.env.MONGO_URI;
const dbClient = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await dbClient.connect();
    await dbClient.db("admin").command({ ping: 1 });
    console.log("Connected.");
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await dbClient.close();
  }
}
run().catch(console.dir);

// Serve Client
app.use(express.static(path.join(__dirname, "..", "client", "dist")));
const indexPath = path.join(__dirname, "../client/dist/index.html");
app.get("*", (req, res) => {
  res.sendFile(indexPath);
});

// Start Server
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`http://${HOST}:${PORT}`);
});
