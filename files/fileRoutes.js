const express = require('express');
const router = express.Router();
const fileController = require('./fileController');

// File upload endpoint
router.post('/upload', fileController.uploadFile);

// File download endpoint
router.get('/download/:filename', fileController.downloadFile);

module.exports = router;
