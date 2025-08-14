import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Weather() {
  const [q, setQ] = useState('Citrusdal');
  const [loc, setLoc] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(()=>{ search(); }, []);

  async function search() {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/weather/search?q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
    const items = await r.json();
    setLoc(items[0]);
  }

  async function load() {
    if (!loc) return;
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/weather?lat=${loc.lat}&lon=${loc.lon}`, { headers: { Authorization: `Bearer ${token}` } });
    setForecast(await r.json());
  }

  useEffect(()=>{ load(); }, [loc]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">7‑Day Weather</h1>
      <div className="flex gap-2">
        <input className="border p-2 rounded" value={q} onChange={e=>setQ(e.target.value)} placeholder="Town or farm" />
        <button onClick={search} className="bg-gray-200 px-3 py-2 rounded">Search</button>
      </div>
      {loc && <p className="text-sm text-gray-600">Selected: {loc.name}, {loc.country} (lat {loc.lat}, lon {loc.lon})</p>}
      {forecast && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast.daily.slice(0,7).map((d:any) => (
            <div key={d.dt} className="bg-white p-4 rounded-2xl shadow">
              <div className="font-semibold">{new Date(d.dt*1000).toLocaleDateString()}</div>
              <div className="text-sm">Temp: {Math.round(d.temp.min)}°C / {Math.round(d.temp.max)}°C</div>
              <div className="text-sm">Rain: {Math.round((d.pop||0)*100)}%</div>
              <div className="text-sm">Wind: {Math.round(d.wind_speed)} m/s</div>
              <div className="text-sm">Humidity: {d.humidity}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}