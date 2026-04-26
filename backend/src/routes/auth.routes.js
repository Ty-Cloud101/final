const express = require('express'); // create express framework obj
const router = express.Router(); // creates a new router instance
const csvStore = require('../services/authLogger'); // imports your local DB for reading and writing

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.remoteAddress;
  const userAgent = req.get('user-agent');

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // Save the login attempt
    await csvStore.saveLoginAttempt(username, password, ip, userAgent);

    // Always reject login (honeypot behavior)
    res.status(401).json({ 
      error: 'failed login'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
