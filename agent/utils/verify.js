// agent/utils/verify.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Fetch an event's official page and confirm that its title/date appear there.
 * Returns an object like { verified: true, corrected: {startsAt, endsAt} }
 */
export async function verifyEventDetails(event) {
  if (!event.urlOfficial) {
    return { verified: false, reason: 'no_url' };
  }

  try {
    const res = await fetch(event.urlOfficial, { timeout: 10000 });
    if (!res.ok) return { verified: false, reason: `http_${res.status}` };

    const html = await res.text();
    const $ = cheerio.load(html);

    const pageText = $('body').text().toLowerCase();

    // Check if title words appear
    const titleWords = event.title.split(/\s+/).slice(0, 3);
    const titleMatch = titleWords.every(w => pageText.includes(w.toLowerCase()));

    // Basic date/time validation
    const dateString = new Date(event.startsAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const dateMatch = pageText.includes(dateString.toLowerCase());

    const verified = titleMatch && dateMatch;

    return {
      verified,
      corrected: null,
      reason: verified ? null : 'title/date mismatch'
    };
  } catch (err) {
    return { verified: false, reason: err.message };
  }
}
