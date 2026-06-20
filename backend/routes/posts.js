const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, optionalAuth } = require('../middleware/auth');

// GET all published posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, tag, category, author, page = 1, limit = 10, sort = '-publishedAt' } = req.query;
    const query = { status: 'published' };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { excerpt: { $regex: search, $options: 'i' } }];
    if (tag) query.tags = { $in: [tag] };
    if (category) query.category = category;
    if (author) query.author = author;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name email avatar bio')
      .select('-content -comments')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my posts (author dashboard)
router.get('/my', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .select('-content').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET featured posts
router.get('/featured', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published', featured: true })
      .populate('author', 'name avatar').select('-content -comments').limit(6);
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET post by slug or ID
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    const query = identifier.match(/^[0-9a-fA-F]{24}$/) ? { _id: identifier } : { slug: identifier };
    const post = await Post.findOne(query)
      .populate('author', 'name email avatar bio website')
      .populate('comments.user', 'name avatar email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.status !== 'published' && (!req.user || req.user._id.toString() !== post.author._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this post' });
    }
    // Increment views
    post.views += 1;
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create post
router.post('/', protect, async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update post
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    Object.assign(post, req.body);
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST like/unlike
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ liked: !liked, likeCount: post.likes.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST bookmark
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const bookmarked = post.bookmarks.includes(req.user._id);
    if (bookmarked) post.bookmarks.pull(req.user._id);
    else post.bookmarks.push(req.user._id);
    await post.save();
    res.json({ bookmarked: !bookmarked });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ user: req.user._id, text });
    await post.save();
    await post.populate('comments.user', 'name avatar');
    res.json(post.comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
