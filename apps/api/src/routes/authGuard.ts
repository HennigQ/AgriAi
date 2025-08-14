import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { isAfter } from 'date-fns';

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = auth.replace('Bearer ', '');
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  (req as any).user = user;

  const { data: profile } = await supabase.from('profiles').select('trial_end').eq('id', user.id).single();
  const today = new Date();
  let allowed = false;

  if (profile?.trial_end && isAfter(profile.trial_end, today)) {
    allowed = true;
  } else {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, end_date')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('end_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub && isAfter(new Date(sub.end_date), today)) {
      allowed = true;
    }
  }

  if (!allowed) return res.status(402).json({ error: 'Subscription required' });

  next();
}