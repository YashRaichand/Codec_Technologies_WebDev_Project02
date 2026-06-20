const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// GET author analytics
router.get('/author', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id });
    const published = posts.filter(p => p.status === 'published');
    const totalViews = published.reduce((sum, p) => sum + p.views, 0);
    const totalLikes = published.reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = published.reduce((sum, p) => sum + p.comments.length, 0);

    const topPosts = published.sort((a, b) => b.views - a.views).slice(0, 5).map(p => ({
      _id: p._id, title: p.title, views: p.views, likes: p.likes.length, comments: p.comments.length
    }));

    // Views over last 30 days (simulated trend from creation dates)
    const viewsByCategory = published.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.views;
      return acc;
    }, {});

    const tagCloud = {};
    published.forEach(p => p.tags.forEach(t => tagCloud[t] = (tagCloud[t] || 0) + 1));

    res.json({
      totalPosts: posts.length,
      publishedPosts: published.length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
      totalViews,
      totalLikes,
      totalComments,
      topPosts,
      viewsByCategory: Object.entries(viewsByCategory).map(([name, views]) => ({ name, views })),
      tagCloud: Object.entries(tagCloud).sort((a,b) => b[1] - a[1]).slice(0,10).map(([tag, count]) => ({ tag, count }))
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET platform stats
router.get('/platform', async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments({ status: 'published' });
    const totalViews = await Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const categories = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ totalPosts, totalViews: totalViews[0]?.total || 0, categories });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
