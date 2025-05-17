import express from "express";
import {readFile, writeFile} from "fs";
import path from "path";

const PORT = 5000;
const DATA_FILE = path.join("data", "links.json");

console.log(DATA_FILE);

const app = express();
app.use(express.static("public"));

const loadLink = async () => {
    try {
        await fs.mkdir("data", {recursive: true});

        try {
            const data = await fs.readFile(DATA_FILE, "utf-8");
            // Check if data is empty
            if(!data.trime()){
                fs.writeFile(DATA_FILE, JSON.stringify({}));
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

