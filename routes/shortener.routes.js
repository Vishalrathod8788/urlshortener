import { Router } from "express";
import { postURLshorten } from "../controller/postshortener.controller.js";


const router = Router();

// POST /shorten - create a new short URL
router.post("/shorten", postURLshorten);

// Redirect to original URL
router.get("/:shortCode", getURLredirect);

//Named export
const shortenerRouter = router;
export { shortenerRouter };