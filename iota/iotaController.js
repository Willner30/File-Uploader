const { SingleNodeClient, sendData, retrieveData } = require("@iota/iota.js");
const { Converter } = require("@iota/util.js");
const crypto = require('crypto');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const client = new SingleNodeClient("https://api.testnet.shimmer.network");
const secretKey = Buffer.from(process.env.SECRET_KEY || '', 'hex');

if (!secretKey.length) {
    console.error("Secret key is not defined or improperly configured.");
    process.exit(1);
}

function encryptData(buffer) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptData(encryptedText) {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedTextBuff = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decrypted = Buffer.concat([decipher.update(encryptedTextBuff), decipher.final()]);
    return decrypted;
}

exports.uploadDataToTangle = async (req, res) => {
    try {
        const { file } = req;
        if (!file) {
            throw new Error('File is required for upload');
        }
        const fileData = fs.readFileSync(file.path);
        const encryptedData = encryptData(fileData);
        const index = Converter.utf8ToBytes("MyAppFiles");
        const data = Converter.utf8ToBytes(encryptedData);

        const sendResult = await sendData(client, index, data);

        // Assuming you would save the messageId along with user or file metadata in your database
        saveFileMetadata({
            userId: req.user.id,
            messageId: sendResult.messageId,
            fileName: file.originalname
        });
        res.status(200).json({ message: 'Message sent successfully', messageId: sendResult.messageId, fileName: file.originalname });
    } catch (error) {
        console.error('Error in uploading to the IOTA Tangle:', error);
        res.status(500).json({ error: 'Error sending message to the IOTA Tangle' });
    }
};

exports.fetchDataFromTangle = async (req, res) => {
    const { messageId } = req.params;
    try {
        const result = await retrieveData(client, messageId);
        if (!result || !result.data) {
            return res.status(404).json({ error: 'No valid payload found in message' });
        }

        const encryptedData = Converter.bytesToUtf8(result.data);
        const decryptedData = decryptData(encryptedData);

        // Set the appropriate headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="downloadedFile"`);

        // Send the decrypted data as the response body
        res.send(decryptedData);
    } catch (error) {
        console.error('Error in fetching from the IOTA Tangle:', error);
        res.status(500).json({ error: 'Error fetching message from the IOTA Tangle' });
    }
};

exports.getUserFiles = async (req, res) => {
    try {
        // Retrieve the user's files from the database or storage
        const userFiles = await getUserFilesFromDatabase(req.user.id);
        res.status(200).json({ files: userFiles });
    } catch (error) {
        console.error('Error retrieving user files:', error);
        res.status(500).json({ error: 'Error retrieving user files' });
    }
};

// Placeholder for function to save file metadata in a database
function saveFileMetadata(metadata) {
    // Save metadata to your database
    console.log('Saving file metadata:', metadata);
}

// Placeholder for function to retrieve user files from a database
async function getUserFilesFromDatabase(userId) {
    // Retrieve metadata from your database
    return [
        { messageId: 'example-message-id', fileName: 'exampleFile.txt' }
    ];
}