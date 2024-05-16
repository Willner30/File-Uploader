//iotaRoutes.js
const express = require('express');
const router = express.Router();
const { uploadDataToTangle, fetchDataFromTangle } = require('./iotaController');

// Endpoint to handle file uploads
router.post('/upload', uploadDataToTangle);

// Endpoint to fetch data from the Tangle
router.get('/message/:id', fetchDataFromTangle);

module.exports = router;
