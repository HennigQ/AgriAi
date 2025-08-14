import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Subscription() {
  const [status, setStatus] = useState<any>(null);
  const [plan, setPlan] = useState<'monthly'|'yearly'>('monthly');

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/subscriptions/status`, { headers: { Authorization: `Bearer ${token}` } });
    setStatus(await r.json());
  }

  async function subscribe() {
    const user = (await supabase.auth.getUser()).data.user!;
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/webhook/payfast/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, user_id: user.id })
    });
    const { url, fields } = await r.json();

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    Object.entries(fields).forEach(([k,v]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = String(v);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Subscription</h1>
      {status?.active_subscription ? (
        <p className="p-3 bg-green-100 border rounded">Active until {new Date(status.active_subscription.end_date).toLocaleDateString()}</p>
      ) : (
        <p className="p-3 bg-yellow-100 border rounded">Trial ends {status?.trial_end ? new Date(status.trial_end).toLocaleDateString() : '—'}. Upgrade to keep access.</p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-2xl shadow border ${plan==='monthly'?'border-green-600':''}`}>
          <h3 className="text-xl font-semibold">Monthly</h3>
          <div className="text-3xl font-bold">R1 499<span className="text-base font-normal">/mo</span></div>
          <button className="mt-3 bg-green-700 text-white px-4 py-2 rounded" onClick={()=>{setPlan('monthly'); subscribe();}}>Subscribe</button>
        </div>
        <div className={`p-4 rounded-2xl shadow border ${plan==='yearly'?'border-green-600':''}`}>
          <h3 className="text-xl font-semibold">Yearly</h3>
          <div className="text-3xl font-bold">R14 999<span className="text-base font-normal">/yr</span></div>
          <button className="mt-3 bg-green-700 text-white px-4 py-2 rounded" onClick={()=>{setPlan('yearly'); subscribe();}}>Subscribe</button>
        </div>
      </div>
    </div>
  );
}