-- Migration: Add deal_documents table for file/document management
-- Run this in your Supabase SQL Editor

-- ============================================
-- DEAL DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deal_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  file_type TEXT, -- MIME type
  category TEXT DEFAULT 'other',
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT deal_documents_category_check CHECK (
    category IN ('contract', 'inspection', 'appraisal', 'title', 'environmental', 'survey', 'lease', 'financial', 'photo', 'legal', 'permit', 'other')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_documents_category ON deal_documents(category);
CREATE INDEX IF NOT EXISTS idx_deal_documents_user_id ON deal_documents(user_id);

-- Enable RLS
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own deal documents" ON deal_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_documents.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own deal documents" ON deal_documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_documents.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can update own deal documents" ON deal_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_documents.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own deal documents" ON deal_documents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_documents.deal_id AND deals.user_id = auth.uid())
  );

-- ============================================
-- STORAGE BUCKET FOR DOCUMENTS
-- Run this separately in Supabase Dashboard > Storage
-- or via Supabase CLI
-- ============================================
-- Note: Storage buckets are typically created via Dashboard or CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('deal-documents', 'deal-documents', false);

-- Storage RLS policies (run in Dashboard > Storage > Policies)
-- These allow authenticated users to manage their own files

-- Policy: Users can upload to their own folder
-- CREATE POLICY "Users can upload documents" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'deal-documents' AND
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Users can read their own files
-- CREATE POLICY "Users can read own documents" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'deal-documents' AND
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Users can delete their own files
-- CREATE POLICY "Users can delete own documents" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'deal-documents' AND
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );
