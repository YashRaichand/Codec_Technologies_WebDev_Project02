import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';

const API = process.env.REACT_APP_API_URL || '';
const COLORS = ['#6d28d9', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/analytics/author`).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div style={{ paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'sans-serif' }}>📊 Analytics</h1>
            <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: 14, marginTop: 4 }}>Your content performance overview</p>
          </div>
          <Link to="/dashboard" className="btn btn-outline" style={{ fontFamily: 'sans-serif' }}>← Dashboard</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Posts', value: data?.totalPosts || 0, icon: '📝' },
            { label: 'Published', value: data?.publishedPosts || 0, icon: '🌐' },
            { label: 'Total Views', value: data?.totalViews || 0, icon: '👁' },
            { label: 'Total Likes', value: data?.totalLikes || 0, icon: '❤️' },
            { label: 'Comments', value: data?.totalComments || 0, icon: '💬' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#6d28d9', fontFamily: 'sans-serif', marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Views by Category */}
          {data?.viewsByCategory?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontFamily: 'sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Views by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.viewsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="views" fill="#6d28d9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tag Cloud */}
          {data?.tagCloud?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontFamily: 'sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top Tags</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.tagCloud.slice(0, 6)} dataKey="count" nameKey="tag" cx="50%" cy="50%" outerRadius={80}
                    label={({ tag, percent }) => `${tag} ${(percent * 100).toFixed(0)}%`}>
                    {data.tagCloud.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Posts */}
        {data?.topPosts?.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontFamily: 'sans-serif', fontSize: 15, fontWeight: 700 }}>Top Performing Posts</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Title', 'Views', 'Likes', 'Comments'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topPosts.map((p, i) => (
                  <tr key={p._id} style={{ borderTop: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600 }}>{p.title}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'sans-serif', fontSize: 13, color: '#6b7280' }}>👁 {p.views}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'sans-serif', fontSize: 13, color: '#6b7280' }}>❤️ {p.likes}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'sans-serif', fontSize: 13, color: '#6b7280' }}>💬 {p.comments}</td>
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
