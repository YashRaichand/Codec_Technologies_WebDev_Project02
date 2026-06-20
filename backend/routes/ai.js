const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Helper: call Anthropic API
async function callClaude(prompt, maxTokens = 1000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-20240307',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

// POST generate blog post outline
router.post('/outline', protect, async (req, res) => {
  try {
    const { topic, tone = 'professional', targetAudience = 'general readers' } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic is required' });

    const prompt = `Create a detailed blog post outline for the topic: "${topic}"
Target audience: ${targetAudience}
Tone: ${tone}

Return a JSON object with this exact structure:
{
  "title": "An engaging blog post title",
  "excerpt": "A 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Category name",
  "outline": [
    { "heading": "Introduction", "points": ["point1", "point2"] },
    { "heading": "Section 1 Title", "points": ["point1", "point2", "point3"] }
  ],
  "seoKeywords": ["keyword1", "keyword2"]
}

Return ONLY the JSON, no markdown or extra text.`;

    const result = await callClaude(prompt, 800);
    const cleaned = result.replace(/```json|```/g, '').trim();
    const outline = JSON.parse(cleaned);
    res.json(outline);
  } catch (err) {
    console.error('AI outline error:', err);
    res.status(500).json({ message: 'AI service error. Check ANTHROPIC_API_KEY.' });
  }
});

// POST generate full blog post content
router.post('/generate', protect, async (req, res) => {
  try {
    const { title, outline, tone = 'professional', wordCount = 600 } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const outlineText = outline ? `\n\nOutline:\n${outline.map(s => `- ${s.heading}: ${s.points?.join(', ')}`).join('\n')}` : '';

    const prompt = `Write a ${wordCount}-word blog post in Markdown format.

Title: ${title}
Tone: ${tone}${outlineText}

Requirements:
- Use proper Markdown headings (##, ###)
- Include engaging introduction
- Include practical examples or insights
- Use bullet points where appropriate
- End with a strong conclusion
- Write naturally, as an expert author

Write the complete blog post content starting with the introduction (do NOT include the title again):`;

    const result = await callClaude(prompt, 1500);
    res.json({ content: result });
  } catch (err) {
    console.error('AI generate error:', err);
    res.status(500).json({ message: 'AI service error. Check ANTHROPIC_API_KEY.' });
  }
});

// POST improve existing content
router.post('/improve', protect, async (req, res) => {
  try {
    const { content, instruction = 'Improve clarity and engagement' } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const prompt = `Improve this blog post content based on this instruction: "${instruction}"

Original content:
${content.slice(0, 2000)}

Return ONLY the improved content in Markdown format, nothing else.`;

    const result = await callClaude(prompt, 1500);
    res.json({ content: result });
  } catch (err) {
    res.status(500).json({ message: 'AI service error' });
  }
});

// POST generate SEO metadata
router.post('/seo', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const prompt = `Generate SEO metadata for this blog post.

Title: ${title}
Content preview: ${content?.slice(0, 500) || ''}

Return JSON only:
{
  "metaTitle": "SEO optimized title under 60 chars",
  "metaDescription": "Compelling description under 160 chars",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

    const result = await callClaude(prompt, 300);
    const cleaned = result.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    res.status(500).json({ message: 'AI service error' });
  }
});

// POST suggest tags
router.post('/tags', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const prompt = `Suggest 5-8 relevant tags for this blog post.
Title: ${title}
Content: ${content?.slice(0, 300) || ''}
Return only a JSON array of strings: ["tag1", "tag2", ...]`;

    const result = await callClaude(prompt, 100);
    const cleaned = result.replace(/```json|```/g, '').trim();
    res.json({ tags: JSON.parse(cleaned) });
  } catch (err) {
    res.status(500).json({ message: 'AI service error' });
  }
});

module.exports = router;
