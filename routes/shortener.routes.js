import { Router } from "express";
import { postURLshorten } from "../controller/postshortener.controller.js";
import { loadLinks, saveLinks } from "../models/shortener.model.js";

const router = Router();

// Serve the Ejs file for the report page
router.use("/report", (req, res) => {
  const student = [
  {name: "Vishal", grade: "A", favoriteSubject: "Computer Science" }
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
router.post("/shorten", postURLshorten(loadLinks, saveLinks));

// Redirect to original URL
router.get("/:shortCode", getURLredirect(loadLinks));

//Named export
const shortenerRouter = router;
export { shortenerRouter };