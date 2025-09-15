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

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Auth middleware
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

// Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password, mobile, gender, dob } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users(name,email,password,mobile,gender,dob) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
      [name, email, hash, mobile, gender, dob]
    );
    res.json({ id: result.rows[0].id });
  } catch (e) {
    res.status(400).json({ error: "Signup failed" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!rows.length) return res.status(401).json({ error: "User not found" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id,name,email,mobile,gender,dob FROM users WHERE id=$1", [req.userId]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Cataract prediction
app.post("/api/predict", authenticateToken, upload.fields([
  { name: "left_eye", maxCount: 1 },
  { name: "right_eye", maxCount: 1 }
]), (req, res) => {
  try {
    if (!req.files || !req.files.left_eye || !req.files.right_eye) {
      return res.status(400).json({ error: "Please upload both left and right eye images" });
    }

    const leftPath = path.join(__dirname, req.files.left_eye[0].path);
    const rightPath = path.join(__dirname, req.files.right_eye[0].path);

    const py = spawn("python", ["predict.py", leftPath, rightPath]);

    let stdoutData = "";
    let stderrData = "";

    py.stdout.on("data", (data) => { stdoutData += data.toString(); });
    py.stderr.on("data", (data) => { stderrData += data.toString(); console.error("Python stderr:", data.toString()); });

    py.on("close", (code) => {
      try {
        const jsonStart = stdoutData.indexOf("{");
        const jsonEnd = stdoutData.lastIndexOf("}") + 1;
        const jsonStr = stdoutData.substring(jsonStart, jsonEnd);
        const output = JSON.parse(jsonStr);
        console.log("Python prediction output:", output);
        res.json(output);
      } catch (e) {
        console.error("Failed to parse Python output:", stdoutData);
        res.status(500).json({ error: "Prediction failed", details: e.message, python_logs: stdoutData + "\n" + stderrData });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));
