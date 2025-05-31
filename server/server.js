// server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve Client
app.use(express.static(path.join(__dirname, "..", "client", "dist")));
const indexPath = path.join(__dirname, "../client/dist/index.html");
app.get("*", (req, res) => {
  res.sendFile(indexPath);
});

// Start Server
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`http://${HOST}:${PORT}`);
});
