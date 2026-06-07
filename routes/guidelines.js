const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Guideline = require('../models/Guideline');
const { isAuthenticated, isPoliceOrAdmin } = require('../middleware/auth');

const router = express.Router();


// =======================
// 📌 GET GUIDELINES PAGE
// =======================
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const guidelines = await Guideline.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .populate('author', 'username');

    res.render('guidelines', {
      guidelines,
      page: 'guidelines'
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      message: 'Failed to load guidelines'
    });
  }
});


// =======================
// 📌 GET ALL GUIDELINES (API)
// =======================
router.get('/api/all', async (req, res) => {
  try {
    const guidelines = await Guideline.find({ isActive: true })
      .sort({ updatedAt: -1 });

    res.json(guidelines);

  } catch (err) {
    res.status(500).json({ error: 'Error fetching guidelines' });
  }
});


// =======================
// 📌 ADD GUIDELINE
// =======================
router.post(
  '/api/add',
  isAuthenticated,
  isPoliceOrAdmin,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('content').trim().notEmpty().isLength({ max: 5000 }),
    body('category').isIn(['general', 'emergency', 'prevention', 'reporting'])
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, category, content } = req.body;

      const guideline = await Guideline.create({
        title,
        category,
        content,
        author: req.session?.userId || null
      });

      res.json(guideline);

    } catch (err) {
      console.error("ADD ERROR:", err);
      res.status(500).json({ error: 'Error adding guideline' });
    }
  }
);


// =======================
// 📌 UPDATE GUIDELINE
// =======================
router.put(
  '/api/:id',
  isAuthenticated,
  isPoliceOrAdmin,
  [
    param('id').isMongoId(),
    body('title').trim().notEmpty(),
    body('content').trim().notEmpty(),
    body('category').isIn(['general', 'emergency', 'prevention', 'reporting'])
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const guideline = await Guideline.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category
        },
        { new: true }
      );

      if (!guideline) {
        return res.status(404).json({ error: 'Guideline not found' });
      }

      res.json(guideline);

    } catch (err) {
      res.status(500).json({ error: 'Error updating guideline' });
    }
  }
);


// =======================
// 📌 DELETE GUIDELINE
// =======================
router.delete(
  '/api/:id',
  isAuthenticated,
  isPoliceOrAdmin,
  [param('id').isMongoId()],
  async (req, res) => {

    try {
      await Guideline.findByIdAndUpdate(
        req.params.id,
        { isActive: false }
      );

      res.json({ message: 'Guideline removed' });

    } catch (err) {
      res.status(500).json({ error: 'Error deleting guideline' });
    }
  }
);


module.exports = router;