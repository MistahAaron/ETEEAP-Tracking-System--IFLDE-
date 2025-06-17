const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Single static directory declaration (adjust the path as needed)
const staticDir = path.join(__dirname, "../../frontend/client");
router.use(express.static(staticDir));

// Route handlers
router.get("/", (req, res) => {
  const filePath = path.join(staticDir, "applicant/home/index.html");

  // Verify file exists before sending
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).send("File not found");
    }
    res.sendFile(filePath);
  });
});

router.get("/applicant-login", (req, res) => {
  const filePath = path.join(staticDir, "applicant/login/login.html");

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).send("File not found");
    }
    res.sendFile(filePath);
  });
});

router.get("/documents/:filename", (req, res) => {
  const filename = req.params.filename;

  if (
    !filename.endsWith(".pdf") ||
    !/^[a-zA-Z0-9_\-\.]+\.pdf$/.test(filename)
  ) {
    return res.status(400).json({ error: "Only PDF files are supported" });
  }

  const filePath = path.join(__dirname, "public", "documents", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

module.exports = router;
