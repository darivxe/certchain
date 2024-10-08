const express = require('express');
const Certificate = require('../models/certificates'); // Adjust the path if necessary
const csvParser = require('csv-parser'); // You may need to install this package: npm install csv-parser
const fs = require('fs');
const router = express.Router();

// Create a new certificate
router.post('/', async (req, res) => {
    const { studentEmail, courseName, issueDate } = req.body;
    try {
        const certificate = new Certificate({ studentEmail, courseName, issueDate });
        await certificate.save();
        res.status(201).json({ message: 'Certificate created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all certificates
router.get('/', async (req, res) => {
    try {
        const certificates = await Certificate.find();
        res.status(200).json(certificates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload certificates in CSV format
router.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvFile = req.files.file;
    const certificates = [];

    csvFile.data.pipe(csvParser())
        .on('data', (row) => {
            const { studentEmail, courseName, issueDate } = row;
            certificates.push(new Certificate({ studentEmail, courseName, issueDate }));
        })
        .on('end', async () => {
            try {
                await Certificate.insertMany(certificates);
                res.status(201).json({ message: 'Certificates uploaded successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to upload certificates', details: error });
            }
        })
        .on('error', (error) => {
            res.status(500).json({ error: 'Failed to parse CSV file', details: error });
        });
});

// Verify certificates by hash
router.get('/verify/:hash', async (req, res) => {
    const { hash } = req.params;
    try {
        const certificate = await Certificate.findOne({ hash });
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        res.json({ message: 'Certificate is valid', certificate });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying certificate', error });
    }
});

module.exports = router;
