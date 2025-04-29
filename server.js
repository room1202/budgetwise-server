// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (_req, res) => {
  return res.send('🚀 Budgetwise AI server is running');
});

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional budget assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();

    console.log('OpenAI raw response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('OpenAI returned an error:', data.error);
      return res.status(500).json({ error: data.error });
    }

    const aiMessage =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (!aiMessage) {
      console.error('No message.content in choices:', data.choices);
      return res.status(500).json({ error: 'Malformed AI response.' });
    }

    return res.json({ response: aiMessage });
  } catch (err) {
    console.error('Error fetching from OpenAI:', err);
    return res.status(500).json({ error: 'AI generation failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
