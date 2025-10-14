// agent/utils/classify.js
import OpenAI from 'openai';
import 'dotenv/config';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple rule-based fallback (if API fails)
function heuristicClassify(text) {
  const lower = text.toLowerCase();
  const adults = /(21\+|18\+|bar|nightclub|burlesque|cocktail|beer|wine|after\s?dark)/;
  return adults.test(lower) ? false : true;
}

export async function classifyEvent(event) {
  const prompt = `
You are an event classification assistant.
Label the following event as either "Family-Friendly" or "Adults-Only".

Title: ${event.title}
Description: ${event.description || 'N/A'}
Venue: ${event.venueName || 'N/A'}

Respond with one word only: "Family" or "Adult".
`;

  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    });

    const answer = res.choices[0].message.content.trim().toLowerCase();
    if (answer.startsWith('adult')) return false;
    if (answer.startsWith('family')) return true;
    return heuristicClassify(`${event.title} ${event.description}`);
  } catch (err) {
    console.warn('⚠️ classifyEvent fallback:', err.message);
    return heuristicClassify(`${event.title} ${event.description}`);
  }
}
