const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = 6000;
const CONTAINER_2_URL = 'http://app2:7000/calculate';

app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    if (!file) {
        return res.status(400).json({ "file": null, "error": "Invalid JSON input." });
    }

    const filePath = `/files/${file}`;
    fs.writeFile(filePath, data, (err) => {
        if (err) {
            return res.status(500).json({ "file": file, "error": "Error while storing the file to the storage." });
        }
        return res.json({ "file": file, "message": "Success." });
    });
});

app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    if (!file) {
        return res.status(400).json({ "file": null, "error": "Invalid JSON input." });
    }

    if (!fs.existsSync(`/files/${file}`)) {
        return res.status(404).json({ "file": file, "error": "File not found." });
    }

    try {
        const response = await axios.post(CONTAINER_2_URL, { file, product });
        return res.json({
            "file": file,
            "sum": response.data.sum
        });
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        } else {
            return res.status(500).json({ "file": file, "error": "Error processing the request." });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Container 1 listening on port ${PORT}`);
});
