import path from "path";
import fs from "fs/promises";

const DATA_FILE = path.join("data", "links.json");

// Load links from file
const loadLinks = async () => {
  try {
    await fs.mkdir("data", { recursive: true });

    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      if (!data.trim()) {
        await fs.writeFile(DATA_FILE, JSON.stringify({}));
        return {};
      }
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT" || error instanceof SyntaxError) {
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

// Save links to file
const saveLinks = async (links) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
  } catch (error) {
    console.error("Error saving links:", error);
  }
};

export { loadLinks, saveLinks };