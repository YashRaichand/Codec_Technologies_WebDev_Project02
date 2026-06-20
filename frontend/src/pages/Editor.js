import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';

const API = process.env.REACT_APP_API_URL || '';

const CATEGORIES = ['Technology', 'Programming', 'Design', 'AI', 'Science', 'Business', 'Career', 'Tutorial', 'Life', 'General'];

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: 'General', tags: '', coverImage: '', status: 'draft' });
  const [aiLoading, setAiLoading] = useState('');
  const [aiError, setAiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [aiPanel, setAiPanel] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`${API}/api/posts/${id}`)
        .then(r => setForm({
          title: r.data.title || '',
          content: r.data.content || '',
          excerpt: r.data.excerpt || '',
          category: r.data.category || 'General',
          tags: r.data.tags?.join(', ') || '',
          coverImage: r.data.coverImage || '',
          status: r.data.status || 'draft'
        })).catch(() => navigate('/dashboard'));
    }
  }, [id]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const save = async (status) => {
    if (!form.title.trim()) return alert('Please add a title');
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: status || form.status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (id) {
        await axios.put(`${API}/api/posts/${id}`, payload);
      } else {
        const res = await axios.post(`${API}/api/posts`, payload);
        navigate(`/editor/${res.data._id}`, { replace: true });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const aiGenerateOutline = async () => {
    if (!aiTopic) return;
    setAiLoading('outline'); setAiError('');
    try {
      const res = await axios.post(`${API}/api/ai/outline`, { topic: aiTopic, tone: aiTone });
      handleChange('title', res.data.title);
      handleChange('tags', res.data.tags?.join(', ') || '');
      handleChange('category', res.data.category || 'General');
      handleChange('excerpt', res.data.excerpt || '');
      // Convert outline to markdown scaffold
      const outlineMarkdown = res.data.outline?.map(s =>
        `## ${s.heading}\n\n${s.points?.map(p => `- ${p}`).join('\n') || ''}\n\n`
      ).join('') || '';
      handleChange('content', outlineMarkdown);
      setAiPanel(false);
    } catch (err) { setAiError(err.response?.data?.message || 'AI error'); }
    setAiLoading('');
  };

  const aiGenerateContent = async () => {
    if (!form.title) return alert('Add a title first');
    setAiLoading('content'); setAiError('');
    try {
      const outlineItems = form.content ? form.content.split('\n').filter(l => l.startsWith('## ') || l.startsWith('# ')).map(l => ({ heading: l.replace(/^#+\s/, ''), points: [] })) : [];
      const res = await axios.post(`${API}/api/ai/generate`, { title: form.title, outline: outlineItems, tone: aiTone, wordCount: 600 });
      handleChange('content', res.data.content);
    } catch (err) { setAiError(err.response?.data?.message || 'AI error'); }
    setAiLoading('');
  };

  const aiImprove = async () => {
    if (!form.content) return alert('Add some content first');
    setAiLoading('improve'); setAiError('');
    try {
      const res = await axios.post(`${API}/api/ai/improve`, { content: form.content, instruction: 'Improve clarity, flow, and engagement. Make it more readable and compelling.' });
      handleChange('content', res.data.content);
    } catch (err) { setAiError(err.response?.data?.message || 'AI error'); }
    setAiLoading('');
  };

  const aiSEO = async () => {
    setAiLoading('seo'); setAiError('');
    try {
      const res = await axios.post(`${API}/api/ai/seo`, { title: form.title, content: form.content });
      handleChange('tags', res.data.keywords?.join(', ') || form.tags);
      handleChange('excerpt', res.data.metaDescription || form.excerpt);
    } catch (err) { setAiError(err.response?.data?.message || 'AI error'); }
    setAiLoading('');
  };

  const wordCount = form.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' }}>←</button>
        <input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Post title..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, fontFamily: 'sans-serif', minWidth: 200 }} />
        <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'sans-serif', flexShrink: 0 }}>{wordCount} words · {readTime} min</span>

        {/* AI Buttons */}
        <button className="btn btn-outline btn-sm" onClick={() => setAiPanel(!aiPanel)} style={{ fontFamily: 'sans-serif', background: aiPanel ? '#f3f0ff' : 'white', borderColor: aiPanel ? '#6d28d9' : '#e5e7eb', color: aiPanel ? '#6d28d9' : '#374151' }}>
          🤖 AI Tools
        </button>
        <button onClick={() => setPreview(!preview)} className="btn btn-outline btn-sm" style={{ fontFamily: 'sans-serif' }}>{preview ? '✏️ Edit' : '👁 Preview'}</button>
        <button onClick={() => save('draft')} className="btn btn-outline btn-sm" disabled={saving} style={{ fontFamily: 'sans-serif' }}>{saving ? '...' : saved ? '✓ Saved' : 'Save Draft'}</button>
        <button onClick={() => save('published')} className="btn btn-primary btn-sm" disabled={saving} style={{ fontFamily: 'sans-serif' }}>Publish</button>
      </div>

      {/* AI Panel */}
      {aiPanel && (
        <div style={{ background: '#faf5ff', borderBottom: '1px solid #e9d5ff', padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontFamily: 'sans-serif', fontSize: 12, fontWeight: 600, color: '#7c3aed', display: 'block', marginBottom: 4 }}>Topic (for outline)</label>
              <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. Future of AI in healthcare" className="form-control" style={{ width: 240, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontFamily: 'sans-serif', fontSize: 12, fontWeight: 600, color: '#7c3aed', display: 'block', marginBottom: 4 }}>Tone</label>
              <select value={aiTone} onChange={e => setAiTone(e.target.value)} className="form-control" style={{ fontSize: 13, width: 150 }}>
                <option>professional</option><option>casual</option><option>educational</option><option>conversational</option><option>technical</option>
              </select>
            </div>
            <button onClick={aiGenerateOutline} className="btn btn-primary btn-sm" disabled={!!aiLoading || !aiTopic} style={{ fontFamily: 'sans-serif', background: '#6d28d9' }}>
              {aiLoading === 'outline' ? '⏳ Generating...' : '📋 Generate Outline'}
            </button>
            <button onClick={aiGenerateContent} className="btn btn-outline btn-sm" disabled={!!aiLoading} style={{ fontFamily: 'sans-serif', borderColor: '#6d28d9', color: '#6d28d9' }}>
              {aiLoading === 'content' ? '⏳ Writing...' : '✍️ Write Full Post'}
            </button>
            <button onClick={aiImprove} className="btn btn-outline btn-sm" disabled={!!aiLoading} style={{ fontFamily: 'sans-serif', borderColor: '#6d28d9', color: '#6d28d9' }}>
              {aiLoading === 'improve' ? '⏳ Improving...' : '✨ Improve Writing'}
            </button>
            <button onClick={aiSEO} className="btn btn-outline btn-sm" disabled={!!aiLoading} style={{ fontFamily: 'sans-serif', borderColor: '#6d28d9', color: '#6d28d9' }}>
              {aiLoading === 'seo' ? '⏳ ...' : '🔍 Auto SEO'}
            </button>
          </div>
          {aiError && <div className="alert alert-error" style={{ marginTop: 10, padding: '8px 12px' }}>{aiError}</div>}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor area */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: 0 }}>
          {!preview ? (
            <textarea value={form.content} onChange={e => handleChange('content', e.target.value)}
              placeholder={`Start writing in **Markdown**...\n\n## Your Section\n\nWrite your content here...`}
              style={{ flex: 1, border: 'none', outline: 'none', padding: '32px', fontSize: 16, lineHeight: 1.8, fontFamily: "'SF Mono', Menlo, monospace", resize: 'none', background: 'white', color: '#1f2937' }} />
          ) : (
            <div className="markdown-body container-sm" style={{ flex: 1, padding: '32px', background: 'white' }}>
              <h1 style={{ fontSize: 32, marginBottom: 24, fontFamily: 'sans-serif', fontWeight: 800 }}>{form.title || 'Untitled'}</h1>
              <div dangerouslySetInnerHTML={{ __html: marked.parse(form.content || '_No content yet_') }} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 280, background: '#f9fafb', borderLeft: '1px solid #e5e7eb', padding: 20, overflow: 'auto', flexShrink: 0 }}>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={form.status} onChange={e => handleChange('status', e.target.value)} style={{ fontSize: 13 }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={form.category} onChange={e => handleChange('category', e.target.value)} style={{ fontSize: 13 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input className="form-control" value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="AI, Machine Learning" style={{ fontSize: 13 }} />
          </div>
          <div className="form-group">
            <label>Cover Image URL</label>
            <input className="form-control" value={form.coverImage} onChange={e => handleChange('coverImage', e.target.value)} placeholder="https://..." style={{ fontSize: 13 }} />
          </div>
          <div className="form-group">
            <label>Excerpt</label>
            <textarea className="form-control" value={form.excerpt} onChange={e => handleChange('excerpt', e.target.value)} placeholder="A brief summary..." rows={4} style={{ fontSize: 13 }} />
          </div>

          <div style={{ background: '#ede9fe', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'sans-serif', color: '#5b21b6' }}>
            <strong>✨ AI Tips:</strong><br/>
            1. Enter a topic and click "Generate Outline"<br/>
            2. Review the outline, then click "Write Full Post"<br/>
            3. Use "Improve Writing" to polish the content<br/>
            4. Click "Auto SEO" to optimize metadata
          </div>
        </div>
      </div>
    </div>
  );
}
