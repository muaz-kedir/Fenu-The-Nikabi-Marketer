-- Add data_url column to media_items to survive container restarts and ephemeral scratch storage
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS data_url TEXT;
