import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import 'dotenv/config';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }
);

export async function getMarketId(slug) {
  const { data, error } = await supabase
    .from('markets')
    .select('id')
    .eq('slug', slug)
    .single();
  if (error || !data) throw new Error(`Market not found: ${slug}`);
  return data.id;
}

export async function getSourceByAdapter(marketId, adapterKey) {
  const { data, error } = await supabase
    .from('sources')
    .select('id, name')
    .eq('market_id', marketId)
    .eq('adapter_key', adapterKey)
    .single();
  if (error || !data) throw new Error(`No source for adapter ${adapterKey}`);
  return data;
}

export function eventHash(e) {
  const key = [
    (e.title || '').trim().toLowerCase(),
    new Date(e.startsAt).toISOString().slice(0, 10),
    (e.venueName || '').trim().toLowerCase()
  ].join('|');
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function upsertEvent(evt) {
  const { data, error } = await supabase
    .from('events')
    .upsert(evt, { onConflict: 'market_id,hash' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function logIngest({ marketId, sourceId, fetched, upserted, errors }) {
  await supabase.from('ingest_runs').insert({
    market_id: marketId,
    source_id: sourceId,
    fetched_count: fetched,
    upserted_count: upserted,
    errors: errors?.length ? errors : null
  });
}
