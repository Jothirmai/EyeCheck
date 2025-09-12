const express = require("express");
const pool = require("./db");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== Multer Config ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ========== Auth Middleware ==========
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = user.id;
    next();
  });
}

// ========== Signup ==========
app.post("/api/signup", async (req, res) => {
  const { name, email, password, mobile, gender, dob } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users(name, email, password, mobile, gender, dob) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
      [name, email, hash, mobile, gender, dob]
    );
    res.json({ id: result.rows[0].id });
  } catch (e) {
    res.status(400).json({ error: "Signup failed" });
  }
});

// ========== Login ==========
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (!rows.length) return res.status(401).json({ error: "User not found" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ========== Upload + QC (Python) ==========
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const eye = req.body.eye; // "left" or "right"
    const imagePath = path.join(__dirname, req.file.path);

    // Spawn Python process
    const py = spawn("python", ["qualitycheck.py", imagePath]);

    let dataString = "";
    py.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    py.on("close", async (code) => {
      try {
        const qc = JSON.parse(dataString);

        // Save result to DB
        await pool.query(
          "INSERT INTO images (user_id, eye, filename, blurry, blurscore, exposurestatus, dynamicrange, checked_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())",
          [
            req.userId,
            eye,
            req.file.filename,
            qc.blurry,
            qc.blurscore,
            qc.exposurestatus,
            qc.dynamicrange,
          ]
        );

        res.json({
          ...qc,
          imageUrl: `/uploads/${req.file.filename}`,
        });
      } catch (e) {
        res
          .status(500)
          .json({ error: "Processing failed", details: e.message });
      }
    });
  }
);

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, mobile, gender, dob FROM users WHERE id=$1",
      [req.userId]
    );

    if (!rows.length) return res.status(404).json({ error: "User not found" });

    res.json(rows[0]); // Send user info
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ========== Start Server ==========
app.listen(3001, () =>
  console.log("Backend running on http://localhost:3001")
);
