import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/subscriptions/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await r.json();
      setStatus(j);
    })
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Welcome{status?.farm_name ? `, ${status.farm_name}` : ''}</h1>
      {status?.trial_end && (
        <div className="p-3 rounded bg-yellow-100 border text-yellow-900 inline-block">Trial ends: {new Date(status.trial_end).toLocaleDateString()}</div>
      )}
      {status?.active_subscription && (
        <div className="p-3 rounded bg-green-100 border text-green-900 inline-block">Active until {new Date(status.active_subscription.end_date).toLocaleDateString()}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <a href="/prices" className="block p-4 rounded-2xl shadow bg-white">Market price trends</a>
        <a href="/weather" className="block p-4 rounded-2xl shadow bg-white">7‑day weather forecast</a>
      </div>
    </div>
  );
}