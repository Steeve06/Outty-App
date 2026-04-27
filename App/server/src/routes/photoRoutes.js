const express = require('express');
const router = express.Router();

const { savePhoto, getPhoto } = require('../services/photoService');

// Upload photo (save URL)
router.post('/:uid', async (req, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    const result = await savePhoto(req.params.uid, photoUrl);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get photo
router.get('/:uid', async (req, res) => {
  try {
    const photo = await getPhoto(req.params.uid);
    res.status(200).json({ photo });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;