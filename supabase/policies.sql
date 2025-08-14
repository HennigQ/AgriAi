create policy if not exists "insert own profile" on public.profiles
for insert with check (auth.uid() = id);