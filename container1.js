const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = 6000;
const CONTAINER_2_URL = 'http://container2-service:7000/calculate'; // URL for container 2 in Kubernetes
const FILE_DIR = '/arta_PV_dir'; // Directory for file storage
//test3
// Ensure the files directory exists
if (!fs.existsSync(FILE_DIR)) {
    fs.mkdirSync(FILE_DIR, { recursive: true });
    console.log('Files directory created');
} else {
    console.log('Files directory already exists');
}

// POST API to store a file
app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    if (!file || !data) {
        console.error('Invalid JSON input:', req.body);
        return res.status(400).json({ "file": null, "error": "Invalid JSON input." });
    }

    const filePath = path.join(FILE_DIR, file);
    console.log(`Saving file to: ${filePath}`);

    fs.writeFile(filePath, data.replace(/ \n/g, '\n'), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ "file": file, "error": "Error while storing the file to the storage." });
        }
        console.log('File saved successfully:', filePath);
        res.json({ "file": file, "message": "Success." });
    });
});

// POST API to request calculation from container 2
app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    if (!file) {
        console.error('Invalid JSON input:', req.body);
        return res.status(400).json({ "file": null, "error": "Invalid JSON input." });
    }

    const filePath = path.join(FILE_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return res.status(404).json({ "file": file, "error": "File not found." });
    }

    try {
        const response = await axios.post(CONTAINER_2_URL, { file, product });
        console.log('Received response from container 2:', response.data);

        return res.json({
            "file": file,
            "sum": response.data.sum
        });
    } catch (error) {
        console.error('Error processing the request:', error.message);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ "file": file, "error": "Error processing the request." });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Container 1 listening on port ${PORT}`);
});
