import 'dotenv/config';
import {
  getMarketId,
  getSourceByAdapter,
  upsertEvent,
  eventHash,
  logIngest
} from './utils/db.js';

import { classifyEvent } from './utils/classify.js';   // ⬅️ new import
import { fetchEvents as cityBoiseFetch } from './adapters/city_boise.js';
import { fetchEvents as icsGenericFetch } from './adapters/ics_generic.js';
import { verifyEventDetails } from './utils/verify.js';


async function runAdapter(marketId, adapterKey, fetchFn) {
  const src = await getSourceByAdapter(marketId, adapterKey);
  console.log(`🟡 Running adapter ${adapterKey} (${src.name})`);

  const start = Date.now();
  const raw = await fetchFn();

  let upserted = 0;
  const errors = [];

for (const ev of raw) {
    try {
      const hash = eventHash(ev);
      const isFamily = await classifyEvent(ev);
  
      // verify official page
      const verification = await verifyEventDetails(ev);
  
      const payload = {
        market_id: marketId,
        source_id: src.id,
        uid: null,
        hash,
        title: ev.title,
        description: ev.description,
        venue_name: ev.venueName,
        venue_address: ev.venueAddress,
        url_official: ev.urlOfficial,
        starts_at: ev.startsAt,
        ends_at: ev.endsAt,
        price_min: ev.priceMin,
        price_max: ev.priceMax,
        is_family_friendly: isFamily,
        tz: 'America/Boise',
        raw: { adapter: adapterKey, verify: verification }
      };
  
      await upsertEvent(payload);
      upserted++;
    } catch (err) {
      errors.push(err.message);
      console.error(`❌ Error upserting ${ev.title}:`, err.message);
    }
  }
  
  

  await logIngest({
    marketId,
    sourceId: src.id,
    fetched: raw.length,
    upserted,
    errors
  });

  console.log(
    `✅ ${adapterKey}: fetched ${raw.length}, upserted ${upserted}, took ${Date.now() - start}ms`
  );
}

async function main() {
  const marketId = await getMarketId(process.env.MARKET_SLUG || 'boise-id');

  const adapters = [
    ['city_boise', cityBoiseFetch],
    ['ics_generic', icsGenericFetch]
  ];

  for (const [key, fn] of adapters) {
    await runAdapter(marketId, key, fn);
  }

  console.log('🎯 All adapters done.');
}

main().catch((e) => {
  console.error('Agent failed:', e);
  process.exit(1);
});
