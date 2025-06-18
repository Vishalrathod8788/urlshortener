import path from "path";
import fs from "fs/promises";
import { Router } from "express";
import { postURLshorten } from "../controller/postshortener.controller.js";

const router = Router();
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

// Serve the Ejs file for the report page
router.use("/report", (req, res) => {
  const student = [
  {name: "Vishal", grade: "A", favoriteSubject: "Computer Science" },
  {name: "John", grade: "B", favoriteSubject: "English"},
  {name: "Alice", grade: "A+", favoriteSubject: "Mathematics"},
  {name: "Bob", grade: "C", favoriteSubject: "History"},
  {name: "Charlie", grade: "B+", favoriteSubject: "Physics"},
  {name: "Diana", grade: "A", favoriteSubject: "Biology"},
  {name: "Ethan", grade: "B-", favoriteSubject: "Chemistry"},
  {name: "Fiona", grade: "A", favoriteSubject: "Art"},
]
  // res.render("report", {student});
  res.render('report', { student: student });
});

// GET /links - return all links
router.get("/links", async (req, res) => {
  const links = await loadLinks();  
  res.json(links);
});

// POST /shorten - create a new short URL
postURLshorten(loadLinks, saveLinks);

// router.post("/shorten", async (req, res) => {
//   try {
//     const { url, shortCode } = req.body;
//     if (!url) {
//       return res.status(400).json({ error: "URL is required" });
//     }

//     const links = await loadLinks();
//     const finalShortCode = shortCode || crypto.randomBytes(3).toString("hex");

//     if (links[finalShortCode]) {
//       return res.status(400).json({
//         error: "Shortcode already exists, please choose another one",
//       });
//     }

//     links[finalShortCode] = url;
//     await saveLinks(links);

//     res.json({ shortUrl: `/${finalShortCode}` });
//   } catch (error) {
//     console.error("Error in /shorten:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Redirect to original URL
router.get("/:shortCode", async (req, res) => {
  const links = await loadLinks();
  const { shortCode } = req.params;

  if (links[shortCode]) {
    return res.redirect(302, links[shortCode]);
  } else {
    return res.status(404).send("404 Page Not Found");
  }
});

// --> Default export
// export default router;

//Named export
const shortenerRouter = router;
export { shortenerRouter };