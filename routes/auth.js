
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login', { error: null });
});

router.post('/login', [
  body('username').trim().notEmpty().escape(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('login', { error: 'Invalid input' });

  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.userRole = user.role;
    res.redirect('/');
  } catch (err) {
    res.render('login', { error: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
