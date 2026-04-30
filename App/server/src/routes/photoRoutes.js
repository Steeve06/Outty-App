const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadPhoto, getPhoto } = require('../services/photoService');

// Store file in memory as buffer
const upload = multer({ storage: multer.memoryStorage() });

// Upload photo
router.post('/:uid', upload.single('photo'), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
      }

      const photoUrl = await uploadPhoto(
          req.params.uid,
          req.file.buffer,
          req.file.mimetype
      );

      res.status(201).json({ message: 'Photo uploaded successfully', photoUrl });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Get photos
router.get('/:uid', async (req, res) => {
  try {
      const photos = await getPhoto(req.params.uid);
      res.status(200).json({ photos });
  } catch (error) {
      res.status(404).json({ error: error.message });
  }
});

module.exports = router;