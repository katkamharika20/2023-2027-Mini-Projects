const express = require('express');
const router = express.Router();

const Alert = require('../models/Alert');
router.get('/api/all', async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching alerts' });
  }
});
router.post('/:id/solve', async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { status: 'solved' });
    res.json({ message: 'Solved' });
  } catch (err) {
    res.status(500).json({ error: 'Error solving alert' });
  }
});
// =======================
// 📌 GET alerts
// =======================
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.render('dashboard', { alerts });
  } catch (err) {
    res.status(500).send('Error loading alerts');
  }
});


// =======================
// 🔴 CREATE ALERT (REAL-TIME HERE)
// =======================
router.post('/api/incoming', async (req, res) => {
  try {
    const alert = await Alert.create({
      type: req.body.type,
      location: {
        latitude: req.body.latitude,
        longitude: req.body.longitude
      },
      deviceId: req.body.deviceId || "Unknown",
      description: req.body.description || "",
      status: "active"   // 🔥 IMPORTANT
    });

    // real-time
    const io = req.app.get('io');
    io.emit('newAlert', alert);

    res.json(alert);

  } catch (err) {
    console.error("ALERT ERROR:", err);  // 🔥 DEBUG
    res.status(500).json({ error: 'Error creating alert' });
  }
});


// =======================
// 📌 SOLVE ALERT
// =======================



// =======================
// 📌 SOLVED PAGE
// =======================
router.get('/solved', async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'solved' });
    res.render('solved', { alerts });
  } catch (err) {
    res.status(500).send('Error loading solved alerts');
  }
});


// =======================
// 📌 ADD NOTE
// =======================
router.post('/api/:id/notes', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    alert.notes.push({
      text: req.body.text
    });

    await alert.save();

    res.json({ message: 'Note added' });

  } catch (err) {
    res.status(500).json({ error: 'Error adding note' });
  }
});
router.get('/api/all', async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching alerts' });
  }
});
module.exports = router;