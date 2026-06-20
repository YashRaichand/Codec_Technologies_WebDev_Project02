import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || '';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/posts/${slug}`)
      .then(r => {
        setPost(r.data);
        if (user) {
          setLiked(r.data.likes?.includes(user._id));
          setBookmarked(r.data.bookmarks?.includes(user._id));
        }
      }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!user) return navigate('/auth');
    try {
      const res = await axios.post(`${API}/api/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setPost(p => ({ ...p, likes: res.data.liked ? [...(p.likes || []), user._id] : (p.likes || []).filter(id => id !== user._id) }));
    } catch {}
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/auth');
    try {
      const res = await axios.post(`${API}/api/posts/${post._id}/bookmark`);
      setBookmarked(res.data.bookmarked);
    } catch {}
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/auth');
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/posts/${post._id}/comments`, { text: comment });
      setPost(p => ({ ...p, comments: res.data }));
      setComment('');
    } catch {}
    setSubmitting(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!post) return null;

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Cover image */}
      {post.coverImage && (
        <div style={{ height: 360, overflow: 'hidden' }}>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div className="container-sm" style={{ paddingTop: 40 }}>
        {/* Category + Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          <span className="tag tag-accent">{post.category}</span>
          {post.tags?.map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 38, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 20, fontFamily: 'sans-serif' }}>{post.title}</h1>

        {/* Author bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '16px 0', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', marginBottom: 36 }}>
          <Link to={`/user/${post.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div className="avatar avatar-lg" style={{ background: '#6d28d9' }}>{post.author?.name?.[0]}</div>
            <div>
              <div style={{ fontFamily: 'sans-serif', fontWeight: 700, color: '#111827' }}>{post.author?.name}</div>
              <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#6b7280' }}>
                {post.readTime} min read · {post.publishedAt && formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
              </div>
            </div>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleLike} className="btn btn-outline btn-sm" style={{ fontFamily: 'sans-serif' }}>
              {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
            </button>
            <button onClick={handleBookmark} className="btn btn-outline btn-sm" style={{ fontFamily: 'sans-serif' }}>
              {bookmarked ? '🔖' : '📄'} Save
            </button>
            {user && user._id === post.author?._id && (
              <Link to={`/editor/${post._id}`} className="btn btn-outline btn-sm" style={{ fontFamily: 'sans-serif' }}>Edit</Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(post.content || '') }} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, marginTop: 32, padding: '16px 0', borderTop: '1px solid #e5e7eb', fontFamily: 'sans-serif', fontSize: 13, color: '#6b7280' }}>
          <span>👁 {post.views} views</span>
          <span>❤️ {post.likes?.length || 0} likes</span>
          <span>💬 {post.comments?.length || 0} comments</span>
        </div>

        {/* Comments */}
        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontFamily: 'sans-serif', fontSize: 20, marginBottom: 24 }}>Comments ({post.comments?.length || 0})</h2>

          {user ? (
            <form onSubmit={submitComment} style={{ marginBottom: 32, display: 'flex', gap: 12 }}>
              <div className="avatar" style={{ background: '#6d28d9', flexShrink: 0 }}>{user.name?.[0]}</div>
              <div style={{ flex: 1 }}>
                <textarea className="form-control" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts..." rows={3} style={{ marginBottom: 10 }} />
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting} style={{ fontFamily: 'sans-serif' }}>{submitting ? 'Posting...' : 'Post Comment'}</button>
              </div>
            </form>
          ) : (
            <div className="alert alert-info" style={{ marginBottom: 24 }}>
              <Link to="/auth" style={{ color: '#6d28d9', fontWeight: 700 }}>Sign in</Link> to leave a comment.
            </div>
          )}

          {post.comments?.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div className="avatar" style={{ background: '#6d28d9', flexShrink: 0 }}>{c.user?.name?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'sans-serif', fontWeight: 700, fontSize: 14 }}>{c.user?.name}</span>
                  <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#9ca3af' }}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                </div>
                <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
