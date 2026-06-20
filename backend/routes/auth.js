const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const genToken = id => jwt.sign({ id }, process.env.JWT_SECRET || 'blog_secret_change_me', { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, bio: bio || '' });
    res.status(201).json({ user, token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ user, token: genToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', protect, (req, res) => res.json(req.user));

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, avatar, website } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, bio, avatar, website }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
