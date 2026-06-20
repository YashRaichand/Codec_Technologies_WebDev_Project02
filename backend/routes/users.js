const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// GET user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const posts = await Post.find({ author: req.params.id, status: 'published' })
      .select('-content -comments').sort({ publishedAt: -1 }).limit(10);
    res.json({ user, posts });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST follow/unfollow
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: "Can't follow yourself" });
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    const isFollowing = req.user.following.includes(req.params.id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { subscribers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { subscribers: req.user._id } });
    }
    res.json({ following: !isFollowing });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
