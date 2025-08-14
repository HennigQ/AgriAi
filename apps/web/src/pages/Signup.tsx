import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

export default function Signup() {
  const [form, setForm] = useState({ full_name:'', email:'', password:'', farm_name:'', province:'', location:'', main_crops:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function onChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error || !data.user) { setError(error?.message || 'Signup failed'); return; }
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: form.email,
      full_name: form.full_name,
      farm_name: form.farm_name,
      province: form.province,
      location: form.location,
      main_crops: form.main_crops.split(',').map(s=>s.trim())
    });
    navigate('/');
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={handleSignup} className="grid gap-3">
        <input className="border p-2 rounded" name="full_name" placeholder="Full name" onChange={onChange} />
        <input className="border p-2 rounded" name="email" placeholder="Email" onChange={onChange} />
        <input className="border p-2 rounded" type="password" name="password" placeholder="Password" onChange={onChange} />
        <input className="border p-2 rounded" name="farm_name" placeholder="Farm/business name" onChange={onChange} />
        <select className="border p-2 rounded" name="province" onChange={onChange} defaultValue="">
          <option value="" disabled>Select province</option>
          {PROVINCES.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
        <input className="border p-2 rounded" name="location" placeholder="Town/area" onChange={onChange} />
        <input className="border p-2 rounded" name="main_crops" placeholder="Main crops (comma separated)" onChange={onChange} />
        <button className="bg-green-700 text-white px-4 py-2 rounded" type="submit">Sign up (7‑day trial)</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}