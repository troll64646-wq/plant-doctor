export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { diagnosis, messages } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = `You are a helpful botanist assistant. The user's plant was diagnosed with: ${diagnosis.diagnosis}.
Cause: ${diagnosis.likelyCause}. Treatment: ${diagnosis.treatment?.join(', ')}.
Answer follow-up questions concisely and helpfully. Keep replies under 3 sentences unless a detailed explanation is truly needed.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://plant-doctor-cclaude-pi.vercel.app',
        'X-Title': 'Plant Doctor'
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Chat failed.' });
  }
}
