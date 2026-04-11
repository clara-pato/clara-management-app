-- Add source column
ALTER TABLE IF EXISTS public.locations ADD COLUMN IF NOT EXISTS source TEXT;

-- Drop existing restrictive policies that lock us out
DROP POLICY IF EXISTS "Restrict ALL operations on locations to authenticated" ON public.locations;
DROP POLICY IF EXISTS "Restrict ALL operations on agents to authenticated" ON public.agents;
DROP POLICY IF EXISTS "Restrict ALL operations on interactions to authenticated" ON public.interactions;
DROP POLICY IF EXISTS "Restrict ALL operations on tasks to authenticated" ON public.tasks;

-- Create correct policies that allow our Service Role to actually read/write data, 
-- and authenticated users to access it from the frontend.
CREATE POLICY "Allow public select for dashboard" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to locations" ON public.locations FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select for dashboard" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to agents" ON public.agents FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select for dashboard" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to interactions" ON public.interactions FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select for dashboard" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access to tasks" ON public.tasks FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);
