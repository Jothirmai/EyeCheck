const express = require('express');
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  const { name, email, password, mobile, gender, dob } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users(name, email, password, mobile, gender, dob) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      [name, email, hash, mobile, gender, dob]
    );
    res.json({ id: result.rows.id });
  } catch (e) {
    res.status(400).json({ error: 'Signup failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (!rows.length) return res.status(401).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, rows.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: rows.id }, process.env.JWT_SECRET);
  res.json({ token });
});

app.listen(3001, () => console.log('API running on http://localhost:3001'));
