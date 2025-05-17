import express from "express";
import {readFile, writeFile} from "fs";
import path from "path";

const PORT = 5000;
const DATA_FILE = path.join("data", "links.json");

console.log(DATA_FILE);

const app = express();

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
            
        }
    } catch (error) {
        
    }
}

const saveLink = async () => {

}

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

