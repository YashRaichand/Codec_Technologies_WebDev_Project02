import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || '';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/users/${id}`)
      .then(r => {
        setProfile(r.data.user);
        setPosts(r.data.posts);
        if (currentUser) setFollowing(r.data.user.subscribers?.includes(currentUser._id));
      }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    try {
      const res = await axios.post(`${API}/api/users/${id}/follow`);
      setFollowing(res.data.following);
      setProfile(p => ({
        ...p,
        subscribers: res.data.following
          ? [...(p.subscribers || []), currentUser._id]
          : (p.subscribers || []).filter(s => s !== currentUser._id)
      }));
    } catch {}
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!profile) return <div className="container" style={{ paddingTop: 40 }}>User not found.</div>;

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Profile header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', color: 'white', padding: '60px 0 40px' }}>
        <div className="container-sm" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 80, height: 80, fontSize: 32, background: '#6d28d9', flexShrink: 0 }}>
            {profile.name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'sans-serif', marginBottom: 6 }}>{profile.name}</h1>
            {profile.bio && <p style={{ color: '#c4b5fd', fontSize: 15, marginBottom: 12 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#a78bfa', fontFamily: 'sans-serif' }}>
              <span>📝 {posts.length} posts</span>
              <span>👥 {profile.subscribers?.length || 0} followers</span>
              {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>🌐 Website</a>}
            </div>
          </div>
          {currentUser && currentUser._id !== id && (
            <button onClick={handleFollow} className="btn" style={{ background: following ? 'rgba(255,255,255,0.15)' : '#6d28d9', color: 'white', fontFamily: 'sans-serif', flexShrink: 0 }}>
              {following ? '✓ Following' : '+ Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="container-sm" style={{ paddingTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'sans-serif', marginBottom: 20 }}>Published Posts</h2>
        {posts.length === 0 ? (
          <div className="empty-state"><p>No posts published yet.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {posts.map(post => (
              <Link key={post._id} to={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  {post.coverImage && <img src={post.coverImage} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
                  <div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {post.tags?.slice(0,2).map(t => <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>)}
                    </div>
                    <h3 style={{ fontFamily: 'sans-serif', fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{post.title}</h3>
                    <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#9ca3af' }}>
                      {post.readTime} min · 👁 {post.views} · ❤️ {post.likes?.length || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
