// agent/adapters/ics_generic.js
import ical from 'ical';
import fetch from 'node-fetch';

export async function fetchEvents() {
  const ICS_URL = 'https://calendar.google.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics';

  console.log('📅 Fetching ICS from', ICS_URL);
  const res = await fetch(ICS_URL);
  if (!res.ok) throw new Error('Failed to download ICS');

  const text = await res.text();
  const data = ical.parseICS(text);

  const events = Object.values(data)
    .filter(ev => ev.type === 'VEVENT')
    .map(ev => ({
      title: ev.summary || 'Untitled',
      description: ev.description || '',
      venueName: 'N/A',
      venueAddress: 'N/A',
      urlOfficial: ev.url || '',
      startsAt: ev.start?.toISOString(),
      endsAt: ev.end?.toISOString(),
      priceMin: null,
      priceMax: null,
      isFamilyFriendly: true
    }));

  console.log(`📥 Parsed ${events.length} events`);
  return events;
}
