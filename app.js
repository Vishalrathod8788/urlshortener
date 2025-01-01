// app.js
import { createServer } from "http";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const PORT = 5000;
const DATA_FILE = path.join("data", "links.json");

// Add CORS headers to allow frontend requests
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Serve static files (HTML, CSS)
const servFile = async (res, filePath, contentType) => {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      ...CORS_HEADERS,
    });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Page Not Found");
  }
};

// Load links from JSON file
const loadLinks = async () => {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir("data", { recursive: true });

    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      // Check if data is empty
      if (!data.trim()) {
        // If file is empty, initialize with empty object
        await fs.writeFile(DATA_FILE, JSON.stringify({}));
        return {};
      }
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        // If file doesn't exist, create it with empty object
        await fs.writeFile(DATA_FILE, JSON.stringify({}));
        return {};
      }
      // If JSON parse error, reinitialize the file
      if (error instanceof SyntaxError) {
        await fs.writeFile(DATA_FILE, JSON.stringify({}));
        return {};
      }
      throw error;
    }
  } catch (error) {
    console.error("Error loading links:", error);
    return {};
  }
};

// Save links to JSON file
const saveLinks = async (links) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
  } catch (error) {
    console.error("Error saving links:", error);
  }
};

const server = createServer(async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Add CORS headers to all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "GET") {
    if (req.url === "/") {
      await servFile(res, path.join("public", "index.html"), "text/html");
    } else if (req.url === "/style.css") {
      await servFile(res, path.join("public", "style.css"), "text/css");
    } else if (req.url === "/links") {
      // Return all links
      const links = await loadLinks();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(links));
    } else {
      // Handle redirect for shortened URLs
      const links = await loadLinks();
      const shortCode = req.url.slice(1);
      if (links[shortCode]) {
        res.writeHead(302, { Location: links[shortCode] });
        res.end();
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Page Not Found");
      }
    }
  } else if (req.method === "POST" && req.url === "/shorten") {
    // Handle URL shortening
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const links = await loadLinks();
        const { url, shortCode } = JSON.parse(body);

        if (!url) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "URL is required" }));
          return;
        }

        // Generate or use provided shortCode
        const finalShortCode =
          shortCode || crypto.randomBytes(3).toString("hex");

        // Check if shortCode already exists
        if (links[finalShortCode]) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Shortcode already exists, please choose another one",
            })
          );
          return;
        }

        // Save new link
        links[finalShortCode] = url;
        await saveLinks(links);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ shortUrl: `/${finalShortCode}` }));
      } catch (error) {
        console.error("Error processing request:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
});

// Start server with port retry logic
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is in use, trying the next one...`);
      PORT++;
      server.close();
      startServer();
    } else {
      console.error("An error occurred:", e.message);
      process.exit(1);
    }
  });
};

startServer();
