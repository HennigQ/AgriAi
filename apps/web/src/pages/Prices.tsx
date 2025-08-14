import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PriceChart from '../components/PriceChart';

const CROPS = ['Oranges','Lemons','Grapefruit','Naartjies','Avocados','Bananas','Litchis','Mangoes'];

export default function Prices() {
  const [crop, setCrop] = useState(CROPS[0]);
  const [province, setProvince] = useState('Western Cape');
  const [data, setData] = useState<any>(null);

  async function load() {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/prices/${encodeURIComponent(crop)}?province=${encodeURIComponent(province)}&days=180`, { headers: { Authorization: `Bearer ${token}` } });
    setData(await r.json());
  }

  useEffect(()=>{ load(); }, [crop, province]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Market Prices</h1>
      <div className="flex gap-3 items-center">
        <select className="border p-2 rounded" value={crop} onChange={e=>setCrop(e.target.value)}>{CROPS.map(c=> <option key={c}>{c}</option>)}</select>
        <input className="border p-2 rounded" value={province} onChange={e=>setProvince(e.target.value)} list="provinces" />
        <datalist id="provinces">
          {['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'].map(p=> <option key={p} value={p} />)}
        </datalist>
      </div>
      {data && (
        <>
          <p className="text-sm text-gray-600">Today: {data.todayPrice ? `R${data.todayPrice}` : '—'} | 7‑day forecast & 30‑day outlook below.</p>
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="font-semibold mb-2">History (last 6 months)</h2>
            <PriceChart data={data.history} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow">
              <h3 className="font-semibold mb-2">7‑Day Forecast</h3>
              <PriceChart data={data.forecast7} />
            </div>
            <div className="bg-white p-4 rounded-2xl shadow">
              <h3 className="font-semibold mb-2">30‑Day Outlook</h3>
              <PriceChart data={data.forecast30} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}