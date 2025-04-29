const express = require('express');
const fetch = require('node-fetch'); 
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());

// POST endpoint for generating AI responses
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', 
                messages: [
                    { role: "system", content: "You are a professional budget assistant helping users manage finances." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await openaiResponse.json();
        res.json({ response: data.choices[0].message.content });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).json({ error: 'AI generation failed.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
