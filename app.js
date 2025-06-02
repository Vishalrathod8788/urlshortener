import express from "express";
import cors from "cors";
import { shortenerRouter } from "./routes/shortener.routes.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static("public")); // Serve static files

// Routes
app.use(shortenerRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});