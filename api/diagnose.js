export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plantName, symptoms, imageBase64, mediaType } = req.body;

  if (!symptoms && !imageBase64) {
    return res.status(400).json({ error: 'Provide symptoms or an image' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const parts = [];

  if (imageBase64) {
    parts.push({ inline_data: { mime_type: mediaType || 'image/jpeg', data: imageBase64 } });
  }

  parts.push({
    text: `Plant: ${plantName || 'Unknown'}\n${symptoms ? `Additional notes: ${symptoms}` : 'Diagnose from the photo.'}\n\nRespond ONLY with a JSON object, no markdown, no backticks:\n{\n  "diagnosis": "name of condition",\n  "severity": "low|medium|high",\n  "whatsHappening": "one sentence plain explanation",\n  "likelyCause": "one sentence cause",\n  "treatment": ["step 1", "step 2", "step 3"],\n  "prevention": "one sentence tip",\n  "prognosis": "one sentence outlook"\n}`
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          systemInstruction: { parts: [{ text: 'You are an expert botanist and plant pathologist. Diagnose plant issues from photos and/or descriptions. Always respond with valid JSON only.' }] },
          generationConfig: { temperature: 0.3 }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'Diagnosis failed. Please try again.' });
  }
}
