
const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  res.render('map', { page: 'map' });
});

module.exports = router;
