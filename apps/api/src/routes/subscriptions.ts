import { Router } from 'express';
import { supabaseAdmin } from '../services/supabase.js';
import { addDays, formatISO } from 'date-fns';

export const subsRouter = Router();

subsRouter.get('/status', async (req: any, res) => {
  const userId = req.user.id as string;
  const { data: profile } = await supabaseAdmin.from('profiles').select('trial_end, farm_name').eq('id', userId).single();
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  res.json({ trial_end: profile?.trial_end, active_subscription: sub || null, farm_name: profile?.farm_name });
});

subsRouter.post('/activate', async (req: any, res) => {
  const { plan, months, amount, startDate, endDate } = req.body as { plan: 'monthly'|'yearly', months?: number, amount: number, startDate?: string, endDate?: string };
  const userId = req.user.id as string;
  const sd = startDate ? new Date(startDate) : new Date();
  const ed = endDate ? new Date(endDate) : addDays(sd, plan==='monthly' ? 30 : 365);
  const { data, error } = await supabaseAdmin.from('subscriptions').insert({
    user_id: userId,
    plan,
    status: 'active',
    start_date: formatISO(sd, { representation: 'date' }),
    end_date: formatISO(ed, { representation: 'date' }),
    amount
  }).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});