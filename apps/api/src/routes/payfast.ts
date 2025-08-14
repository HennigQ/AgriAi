import { Router } from 'express';
import type { Request, Response } from 'express';
import { validateSignature } from '../services/payfast.js';
import { supabaseAdmin } from '../services/supabase.js';
import CidrMatcher from 'cidr-matcher';

export const payfastRouter = Router();

function isValidSourceIP(ip?: string) {
  if (!ip) return false;
  const list = (process.env.PAYFAST_IP_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!list.length) return true;
  const matcher = new CidrMatcher(list);
  return matcher.contains(ip);
}

payfastRouter.post('/', async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    if (!isValidSourceIP(ip)) return res.status(400).send('Bad source IP address');

    const payload = req.body as Record<string, string>;

    if (!validateSignature(payload)) return res.status(400).send('Invalid signature');

    if (payload.merchant_id !== process.env.PAYFAST_MERCHANT_ID) return res.status(400).send('Invalid merchant');

    const amount = Number(payload.amount_gross || payload.amount || 0);

    const userId = payload.custom_str1;
    if (!userId) return res.status(400).send('Missing user link');

    const plan = (payload.item_name || '').toLowerCase().includes('year') ? 'yearly' : 'monthly';

    const start = new Date();
    const end = new Date(start);
    if (plan === 'yearly') end.setDate(end.getDate() + 365);
    else end.setDate(end.getDate() + 30);

    await supabaseAdmin.from('subscriptions').insert({
      user_id: userId,
      plan: plan as any,
      status: 'active',
      start_date: start.toISOString().slice(0,10),
      end_date: end.toISOString().slice(0,10),
      amount
    });

    return res.status(200).send('OK');
  } catch (e) {
    console.error(e);
    return res.status(500).send('ERROR');
  }
});

payfastRouter.post('/session', async (req: Request, res: Response) => {
  const { plan, amount, user_id } = req.body as { plan: 'monthly'|'yearly', amount?: number, user_id: string };
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  const isLive = process.env.PAYFAST_MODE === 'live';
  const base = isLive ? 'https://www.payfast.co.za/eng/process' : 'https://sandbox.payfast.co.za/eng/process';

  const itemName = plan === 'yearly' ? 'AgriAI Pro — Yearly' : 'AgriAI Pro — Monthly';
  const amt = amount ?? (plan === 'yearly' ? 14999 : 1499);

  const fields: Record<string,string|number> = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${process.env.PUBLIC_APP_URL}/subscribe/success`,
    cancel_url: `${process.env.PUBLIC_APP_URL}/subscribe/cancel`,
    notify_url: `${process.env.PUBLIC_API_URL}/webhook/payfast`,
    name_first: '',
    name_last: '',
    email_address: '',
    m_payment_id: `${user_id}-${Date.now()}`,
    amount: amt.toFixed(2),
    item_name: itemName,
    custom_str1: user_id
  };

  const { generateSignature } = await import('../services/payfast.js');
  const signature = generateSignature(fields);

  res.json({ url: base, fields: { ...fields, signature } });
});