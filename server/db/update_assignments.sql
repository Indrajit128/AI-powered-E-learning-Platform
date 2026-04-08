-- Update Assignments table to support file uploads
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Ensure the bucket exists (this is a SQL command for Supabase, but bucket creation is usually via storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true) ON CONFLICT (id) DO NOTHING;
