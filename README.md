# AgriAI Pro — Setup

## Prereqs
- Node 20+
- pnpm `npm i -g pnpm`
- Supabase project (get URL + anon + service role keys)
- PayFast account (enable Sandbox first). Set **Security Passphrase** in Developer Settings.
- OpenWeather API key

## 1) Configure Supabase
- Run SQL in `supabase/schema.sql` (SQL editor).
- (Optional) add policies from `supabase/policies.sql`.

## 2) Env
- Copy `.env.example` to apps/api/.env and apps/web/.env and root `.env` if you prefer.
- In `apps/web/.env` add:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (e.g. http://localhost:8787)
- In `apps/api/.env` add:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`
  - `OPENWEATHER_API_KEY`
  - `PAYFAST_*` values and `PUBLIC_APP_URL`, `PUBLIC_API_URL`
  - `VITE_SUPABASE_ANON_KEY` (needed for authGuard validation)

## 3) Install
```bash
pnpm i
```

## 4) Run locally
```bash
pnpm dev:api
pnpm dev:web
```

Front-end: http://localhost:5173  
API:       http://localhost:8787

> Note: PayFast ITN cannot call `localhost`. Use a tunnel (e.g. ngrok) and set `PUBLIC_API_URL` to the tunnel URL.

## 5) Testing payments (Sandbox)
- Use PayFast Sandbox merchant ID/Key.
- Ensure your **passphrase** in dashboard matches `PAYFAST_PASSPHRASE`.
- The backend signs checkout payloads and validates ITN `signature`.
- Whitelist PayFast IP ranges or keep `PAYFAST_IP_WHITELIST` empty to skip IP check while testing.

## 6) Data seeding (prices)
Use the `POST /api/prices` endpoint from backend (service role) to insert rows like:
```json
{ "crop": "Oranges", "province": "Western Cape", "price_per_kg": 6.45, "date": "2025-07-30" }
```

## 7) Production notes
- Host API on Fly.io, Render, or Railway.
- Host Web on Netlify/Vercel (set `VITE_API_URL` to the API URL).
- Set `TZ=Africa/Johannesburg` on the API for correct cut-offs.
- Keep price data updated daily (manual upload or connect your data source).
- To implement **recurring** PayFast billing, extend `/webhook/payfast/session` to include recurring fields (frequency/cycles + token) and store token in `subscriptions.pf_token`.