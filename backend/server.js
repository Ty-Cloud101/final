const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./src/services/authLogger');
const authRoutes = require('./src/routes/auth.routes');

// App Initialization
const app = express();
app.set('trust proxy', true); 
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // allow frontend to talk to backend (different port/domain)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

// Initialize storage
db.init().catch((error) => {
  console.error('Failed to initialize CSV storage:', error);
  process.exit(1);
});

// Routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Honeypot server running on port ${PORT}`);
});
