import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { forecastPrices } from '../services/forecast.js';

export const pricesRouter = Router();

pricesRouter.get('/:crop', async (req, res) => {
  const crop = String(req.params.crop);
  const province = String(req.query.province || '');
  const days = Number(req.query.days || 120);

  let q = supabaseAdmin.from('daily_prices').select('date, price_per_kg').eq('crop', crop);
  if (province) q = q.eq('province', province);
  const since = new Date(Date.now() - days*86400000).toISOString().slice(0,10);
  const { data, error } = await q.gte('date', since).order('date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  const forecast7 = forecastPrices(data || [], 7);
  const forecast30 = forecastPrices(data || [], 30);
  const todayPrice = (data || []).slice(-1)[0]?.price_per_kg ?? null;

  res.json({ crop, province, todayPrice, history: data || [], forecast7, forecast30 });
});

pricesRouter.post('/', async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : [req.body];
  const { data, error } = await supabaseAdmin.from('daily_prices').insert(rows).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});