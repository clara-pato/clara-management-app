-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('location_photos', 'location_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'location_photos');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'location_photos');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'location_photos');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'location_photos');

-- Create location_photos table
CREATE TABLE location_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for location_photos
ALTER TABLE location_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON location_photos FOR SELECT USING (true);
CREATE POLICY "Allow auth all access" ON location_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
