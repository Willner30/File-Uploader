const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(__dirname, 'uploads'); // Make sure this directory exists

// Ensure upload directory exists
if (!fs.existsSync(uploadDirectory)){
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

exports.uploadFile = (req, res) => {
    try {
        // Implement file saving logic here
        res.json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.downloadFile = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDirectory, filename);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error("File not found:", err);
            return res.status(404).send('File not found');
        }

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
};
