//authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('./authController');

// Registration endpoint
router.post('/users', registerUser);

// Login endpoint
router.post('/login', loginUser);

module.exports = router;
