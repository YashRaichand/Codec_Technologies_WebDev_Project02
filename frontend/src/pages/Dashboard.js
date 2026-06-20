import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const API = process.env.REACT_APP_API_URL || '';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/posts/my`).then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API}/api/posts/${id}`);
      setPosts(p => p.filter(post => post._id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  const published = posts.filter(p => p.status === 'published');
  const drafts = posts.filter(p => p.status === 'draft');

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div style={{ paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'sans-serif' }}>My Posts</h1>
            <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: 14, marginTop: 4 }}>{published.length} published · {drafts.length} drafts</p>
          </div>
          <Link to="/editor" className="btn btn-primary" style={{ fontFamily: 'sans-serif' }}>+ Write New Post</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Total Posts', value: posts.length, icon: '📝' },
            { label: 'Published', value: published.length, icon: '🌐' },
            { label: 'Drafts', value: drafts.length, icon: '✏️' },
            { label: 'Total Views', value: posts.reduce((s, p) => s + (p.views || 0), 0), icon: '👁' },
            { label: 'Total Likes', value: posts.reduce((s, p) => s + (p.likes?.length || 0), 0), icon: '❤️' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#6d28d9', fontFamily: 'sans-serif', marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 60 }}>✍️</div>
            <h3 style={{ marginTop: 12, fontFamily: 'sans-serif' }}>No posts yet</h3>
            <p style={{ marginTop: 8 }}>Write your first blog post!</p>
            <Link to="/editor" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex', fontFamily: 'sans-serif' }}>Start Writing</Link>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Title', 'Status', 'Views', 'Likes', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <tr key={post._id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'sans-serif', fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 2 }}>{post.title}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'sans-serif' }}>{post.readTime} min · {post.category}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${post.status}`}>{post.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'sans-serif', fontSize: 13, color: '#6b7280' }}>{post.views || 0}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'sans-serif', fontSize: 13, color: '#6b7280' }}>{post.likes?.length || 0}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'sans-serif', fontSize: 12, color: '#9ca3af' }}>
                      {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {post.status === 'published' && (
                          <Link to={`/post/${post.slug}`} className="btn btn-outline btn-sm" style={{ fontFamily: 'sans-serif' }}>View</Link>
                        )}
                        <Link to={`/editor/${post._id}`} className="btn btn-outline btn-sm" style={{ fontFamily: 'sans-serif' }}>Edit</Link>
                        <button onClick={() => deletePost(post._id)} className="btn btn-danger btn-sm" style={{ fontFamily: 'sans-serif' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
