import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PORT = 5000;
const DATA_FILE = path.join("data", "links.json");

console.log(DATA_FILE);

const app = express();
app.use(express.static("public"));

const loadLink = async () => {
    try {
        const data = fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if(error.code === "ENOENT") {
            // If file doesn't exist, create it with empty object
            await fs.writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw error;
    }
}

const saveLink = async (links) => {
    try {
        const data = await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
    } catch (error) {
        console.error("Error saving links:", error);
    }
}

app.get("/", (req, res) => {
    try {
        const file = fs.readFile(path.join("views", "index.html"));
        const links = loadLink();
        
    } catch (error) {
        return res.status(500).send("Error loading index.html");
    }
});

app.post("/", (req, res) => {
    try {
        const {url, Shortcode} = req.body;
        const finalShortCode = Shortcode || crypto.randomBytes(4).toString("hex");

        const links = loadLink();

        if(links[finalShortCode]){
            return res.status(400).send("Shortcode already exists");
        }
        links[finalShortCode] = url;
    } catch (error) {
        console.error("Error saving link:", error);
        return res.status(500).send("Error saving link");
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

