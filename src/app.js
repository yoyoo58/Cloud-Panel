const express = require("express");
const cors = require("cors");
const multer = require("multer");

const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const FRONTEND = path.join(__dirname, "./frontend");
const ICON = path.join(__dirname, "./frontend/favicon.ico");
const STORAGE = path.join(__dirname, "./storage");

if (!fs.existsSync(STORAGE)) {
    fs.mkdirSync(STORAGE, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use("/files", express.static(STORAGE));
app.use(express.static(FRONTEND));
app.use("/favicon.ico", express.static(ICON));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const reqPath = req.query.path || "";

        const safePath = path
            .normalize(reqPath)
            .replace(/^(\.\.(\/|\\|$))+/, "");

        const uploadDir = path.join(STORAGE, safePath);

        fs.mkdirSync(uploadDir, { recursive: true });

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.get("/api/files", (req, res) => {
    const reqPath = req.query.path || "";

    const safePath = path.normalize(reqPath).replace(/^(\.\.(\/|\\|$))+/, "");

    const dir = path.join(STORAGE, safePath);

    if (!fs.existsSync(dir)) {
        return res.status(404).json({ error: "dossier introuvable" });
    }

    const files = fs.readdirSync(dir);

    const data = files.map(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        return {
            name: file,
            isDirectory: stats.isDirectory()
        };
    });

    res.json(data);
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    res.json({
        success: true,
        file: req.file.filename
    });
});

app.delete("/api/delete/:name", (req, res) =>
{
    try
    {
        const safePath = path
            .normalize(req.params.name)
            .replace(/^(\.\.(\/|\\|$))+/, "");

        const file = path.join(STORAGE, safePath);

        if (!fs.existsSync(file))
        {
            return res.status(404).json({
                error: "introuvable"
            });
        }

        const stats = fs.statSync(file);

        if (stats.isDirectory())
        {
            fs.rmSync(file,
            {
                recursive: true,
                force: true
            });
        }
        else
        {
            fs.unlinkSync(file);
        }

        res.json({ success: true });
    }
    catch (err)
    {
        console.error(err);

        res.status(500).json({
            error: "erreur serveur"
        });
    }
});

app.post("/api/folder", (req, res) => {
    const name = req.body.name;

    if (!name) {
        return res.status(400).json({ error: "nom manquant" });
    }

    const folderPath = path.join(STORAGE, name);

    if (fs.existsSync(folderPath)) {
        return res.status(400).json({ error: "dossier existe déjà" });
    }

    fs.mkdirSync(folderPath, { recursive: true });

    res.json({
        success: true,
        folder: name
    });
});

app.get("/file", (req, res) => {
    const reqPath = req.query.path;

    if (!reqPath) {
        return res.status(400).json({ error: "path manquant" });
    }

    const safePath = path.normalize(reqPath).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.join(STORAGE, safePath);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "fichier introuvable" });
    }

    res.sendFile(filePath);
});

app.listen(PORT, () => {
    console.log("Cloud running on port " + PORT);
});