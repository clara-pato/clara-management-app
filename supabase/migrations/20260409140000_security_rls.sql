-- Enable Row Level Security on all required tables
ALTER TABLE IF EXISTS public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies restricting all operations to authenticated users
CREATE POLICY "Restrict ALL operations on locations to authenticated"
ON public.locations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Restrict ALL operations on agents to authenticated"
ON public.agents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Restrict ALL operations on interactions to authenticated"
ON public.interactions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Restrict ALL operations on tasks to authenticated"
ON public.tasks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
