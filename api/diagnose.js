export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plantName, symptoms, imageBase64, mediaType } = req.body;
  if (!symptoms && !imageBase64) return res.status(400).json({ error: 'Provide symptoms or an image' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const userContent = [];
  if (imageBase64) {
    userContent.push({ type: "image_url", image_url: { url: `data:${mediaType || 'image/jpeg'};base64,${imageBase64}` } });
  }
  userContent.push({
    type: "text",
    text: `Plant: ${plantName || 'Unknown'}\n${symptoms ? `Notes: ${symptoms}` : 'Diagnose from the photo.'}\n\nRespond ONLY with this JSON, nothing else:\n{"diagnosis":"string","severity":"low|medium|high","confidence":85,"whatsHappening":"string","likelyCause":"string","treatment":["step1","step2","step3"],"prevention":"string","prognosis":"string"}`
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://doctor-plant.vercel.app',
        'X-Title': 'Plant Doctor'
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          { role: "system", content: "You are a plant pathologist. Respond only with valid JSON, no markdown, no explanation, no backticks." },
          { role: "user", content: userContent }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON robustly
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    const parsed = JSON.parse(jsonMatch[0]);
    res.status(200).json(parsed);
  } catch (e) {
    console.error('Diagnose error:', e.message);
    res.status(500).json({ error: 'Diagnosis failed. Please try again.' });
  }
}