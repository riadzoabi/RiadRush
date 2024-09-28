const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);  // Save file with original name
    }
});

// Initialize Multer
const upload = multer({ storage: storage });

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle file uploads via POST
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    res.json({ success: true, filename: req.file.filename });
});

// Handle file download requests
app.get('/download', (req, res) => {
    const fileName = req.query.file;
    if (fileName) {
        const filePath = path.join(__dirname, 'uploads', fileName);
        res.download(filePath, fileName);
    } else {
        res.status(400).send('No file specified.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
