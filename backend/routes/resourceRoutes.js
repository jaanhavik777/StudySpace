const express = require('express');
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const router = express.Router();

// creates new resource (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, link, subject, uploadedBy } = req.body;
    if (!title) return res.status(400).json({ message: 'Missing title' });

    const r = await Resource.create({
      title,
      description: description || '',
      link: link || '',
      subject: subject || '',                    
      uploadedBy: uploadedBy || req.user.email,  
    });

    return res.json(r);
  } catch (e) {
    console.error("RESOURCE CREATE ERROR:", e);
    return res.status(500).json({ message: 'Create failed' });
  }
});

// gets all resources (doesnt req authentication)
router.get('/', async (req, res) => {
  try {
    const list = await Resource.find().sort({ createdAt: -1 }).lean();
    return res.json(list);
  } catch (e) {
    console.error("RESOURCE LIST ERROR:", e);
    return res.status(500).json([]);
  }
});

// delete resource (auth required)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Resource not found' });
    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error("RESOURCE DELETE ERROR:", e);
    return res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
