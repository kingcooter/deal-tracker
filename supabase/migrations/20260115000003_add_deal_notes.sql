-- Deal Notes Table
-- Stores timestamped notes/comments for deals

CREATE TABLE IF NOT EXISTS deal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups by deal
CREATE INDEX IF NOT EXISTS idx_deal_notes_deal_id ON deal_notes(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_notes_created_at ON deal_notes(created_at DESC);

-- Enable RLS
ALTER TABLE deal_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own deal notes"
  ON deal_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deal notes"
  ON deal_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal notes"
  ON deal_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal notes"
  ON deal_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deal_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_notes_updated_at
  BEFORE UPDATE ON deal_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_notes_updated_at();
