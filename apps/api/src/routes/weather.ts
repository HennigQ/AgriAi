import { Router } from 'express';
import got from 'got';
import NodeCache from 'node-cache';
import { supabaseAdmin } from '../services/supabase.js';

export const weatherRouter = Router();
const cache = new NodeCache({ stdTTL: 1800 });

function keyFor(lat: number, lon: number) {
  const rl = (n: number) => Math.round(n * 100) / 100;
  return `geocode:${rl(lat)},${rl(lon)}`;
}

weatherRouter.get('/search', async (req, res) => {
  const q = String(req.query.q || '');
  if (!q) return res.status(400).json({ error: 'Missing q' });
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${process.env.OPENWEATHER_API_KEY}`;
  const r = await got(geoUrl).json<any>();
  res.json(r);
});

weatherRouter.get('/', async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!lat || !lon) return res.status(400).json({ error: 'lat/lon required' });

  const k = keyFor(lat, lon);
  const inMem = cache.get(k);
  if (inMem) return res.json(inMem);

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
  const data = await got(url).json<any>();

  await supabaseAdmin
    .from('weather_cache')
    .upsert({ cache_key: k, forecast_json: data, updated_at: new Date().toISOString() })
    .select('*');

  cache.set(k, data);
  res.json(data);
});