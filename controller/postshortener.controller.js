import crypto from "crypto";

export const getURLredirect = (loadLinks) => async (req, res) => {
  const links = await loadLinks();
  const { shortCode } = req.params;

  if (links[shortCode]) {
    return res.redirect(302, links[shortCode]);
  } else {
    return res.status(404).send("404 Page Not Found");
  }
}

export const postURLshorten = (loadLinks, saveLinks) => async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const links = await loadLinks();
    const finalShortCode = shortCode || crypto.randomBytes(3).toString("hex");

    if (links[finalShortCode]) {
      return res.status(400).json({
        error: "Shortcode already exists, please choose another one",
      });
    }

    links[finalShortCode] = url;
    await saveLinks(links);

    res.json({ shortUrl: `/${finalShortCode}` });
  } catch (error) {
    console.error("Error in /shorten:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}