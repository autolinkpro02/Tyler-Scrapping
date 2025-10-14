// agent/adapters/city_boise.js
export async function fetchEvents() {
    // later: scrape or fetch ICS feed
    return [
      {
        title: 'Zoo Halloween Night',
        description: 'Family fun event at the city zoo',
        venueName: 'Boise Zoo',
        venueAddress: '355 Julia Davis Dr, Boise, ID',
        urlOfficial: 'https://boisezoo.org/event/zoo-halloween-night',
        startsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        endsAt: new Date(Date.now() + 7 * 86400000 + 2 * 3600000).toISOString(),
        priceMin: 10,
        priceMax: 25,
        isFamilyFriendly: true
      }
    ];
  }
  