import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const API = process.env.REACT_APP_API_URL || '';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => fetchPosts(), 300);
    return () => clearTimeout(timer);
  }, [search, tag, page]);

  useEffect(() => {
    axios.get(`${API}/api/posts/featured`).then(r => setFeatured(r.data)).catch(() => {});
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.set('search', search);
      if (tag) params.set('tag', tag);
      const res = await axios.get(`${API}/api/posts?${params}`);
      setPosts(res.data.posts);
      setTotalPages(res.data.pages);
    } catch {}
    setLoading(false);
  };

  const popularTags = ['Technology', 'Programming', 'Design', 'AI', 'Web Dev', 'Career', 'Tutorial', 'Science'];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', color: 'white', padding: '80px 0 60px' }}>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, fontFamily: 'sans-serif', lineHeight: 1.2 }}>Ideas powered by <span style={{ color: '#a78bfa' }}>AI</span></h1>
          <p style={{ fontSize: 18, color: '#c4b5fd', marginBottom: 36, fontFamily: 'sans-serif' }}>Discover stories, thinking, and expertise — written by humans, enhanced by AI.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles..." className="form-control" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8 }} />
            <Link to="/editor" className="btn btn-primary" style={{ background: '#7c3aed', flexShrink: 0 }}>Write</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40 }}>
        {/* Tag filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          <button onClick={() => { setTag(''); setPage(1); }} className="tag" style={{ background: !tag ? '#6d28d9' : '#f3f4f6', color: !tag ? 'white' : '#374151' }}>All</button>
          {popularTags.map(t => (
            <button key={t} onClick={() => { setTag(t === tag ? '' : t); setPage(1); }} className="tag" style={{ background: tag === t ? '#6d28d9' : '#f3f4f6', color: tag === t ? 'white' : '#374151' }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner"></div></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 60 }}>📝</div>
            <h3 style={{ marginTop: 12 }}>No posts found</h3>
            <p style={{ marginTop: 8 }}>Be the first to write about this topic!</p>
            <Link to="/editor" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Write a Post</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className="btn" style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', background: p === page ? '#6d28d9' : 'white', color: p === page ? 'white' : '#374151', border: '1px solid #e5e7eb', fontFamily: 'sans-serif' }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div className="post-card">
        {post.coverImage && <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {post.tags?.slice(0,2).map(t => <span key={t} className="tag tag-accent" style={{ fontSize: 11 }}>{t}</span>)}
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8, lineHeight: 1.4, fontFamily: 'sans-serif' }}>{post.title}</h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 14, fontFamily: 'sans-serif' }}>{post.excerpt?.slice(0, 100)}...</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, background: '#6d28d9' }}>{post.author?.name?.[0]}</div>
              <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#6b7280' }}>{post.author?.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af', fontFamily: 'sans-serif' }}>
              <span>👁 {post.views}</span>
              <span>❤️ {post.likes?.length || 0}</span>
              <span>{post.readTime} min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
