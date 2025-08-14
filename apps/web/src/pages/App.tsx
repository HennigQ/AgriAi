import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div>
      <nav className="flex items-center justify-between px-6 py-3 bg-green-700 text-white">
        <div className="font-semibold"><Link to="/">AgriAI Pro</Link></div>
        <div className="flex gap-4">
          <Link to="/prices">Prices</Link>
          <Link to="/weather">Weather</Link>
          <Link to="/subscription">Subscription</Link>
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          ) : (
            <button onClick={() => supabase.auth.signOut().then(()=>navigate('/login'))}>Logout</button>
          )}
        </div>
      </nav>
      <main className="p-6 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}