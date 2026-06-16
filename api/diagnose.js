export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plantName, symptoms, imageBase64, mediaType } = req.body;

  if (!symptoms && !imageBase64) {
    return res.status(400).json({ error: 'Provide symptoms or an image' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const userContent = [];

  if (imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${mediaType || 'image/jpeg'};base64,${imageBase64}` }
    });
  }

  userContent.push({
    type: "text",
    text: `Plant: ${plantName || 'Unknown'}\n${symptoms ? `Additional notes: ${symptoms}` : 'Diagnose from the photo.'}\n\nRespond ONLY with a JSON object, no markdown, no backticks:\n{\n  "diagnosis": "name of condition",\n  "severity": "low|medium|high",\n  "whatsHappening": "one sentence plain explanation",\n  "likelyCause": "one sentence cause",\n  "treatment": ["step 1", "step 2", "step 3"],\n  "prevention": "one sentence tip",\n  "prognosis": "one sentence outlook"\n}`
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://plant-doctor.vercel.app',
        'X-Title': 'Plant Doctor'
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          { role: "system", content: "You are an expert botanist and plant pathologist. Diagnose plant issues from photos and/or descriptions. Always respond with valid JSON only, no markdown." },
          { role: "user", content: userContent }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'Diagnosis failed. Please try again.' });
  }
}