export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { messages, system } = req.body;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: system || '' }] },
                    contents: messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                })
            }
        );

        const data = await response.json();
        if (data.error) return res.status(500).json({ error: data.error.message });

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        res.json({ text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
