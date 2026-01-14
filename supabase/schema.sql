-- DealTracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLEANUP (drop existing tables to start fresh)
-- Drop in reverse order of dependencies
-- CASCADE will also drop policies, triggers, etc.
-- ============================================
DROP TABLE IF EXISTS deal_contacts CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS deal_workflows CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_completed_at_column() CASCADE;

-- ============================================
-- CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT contacts_role_check CHECK (role IS NULL OR role IN ('internal', 'broker', 'lender', 'attorney', 'contractor', 'vendor', 'other'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(role);

-- ============================================
-- DEALS TABLE (each deal = one property)
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',

  -- Property details
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  property_type TEXT,
  image_url TEXT,
  notes TEXT,

  -- Optional property fields
  sf NUMERIC,
  lot_size NUMERIC,
  year_built INTEGER,
  zoning TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT deals_status_check CHECK (status IN ('active', 'closed', 'on-hold')),
  CONSTRAINT deals_property_type_check CHECK (property_type IS NULL OR property_type IN ('office', 'retail', 'industrial', 'multifamily', 'land', 'mixed-use'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

-- ============================================
-- WORKFLOW TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Insert default workflow templates
INSERT INTO workflow_templates (name, icon, color, is_default, sort_order) VALUES
  ('Finance', 'dollar-sign', '#3b82f6', TRUE, 1),
  ('Legal', 'scale', '#8b5cf6', TRUE, 2),
  ('Due Diligence', 'search', '#10b981', TRUE, 3),
  ('Construction', 'hard-hat', '#f59e0b', TRUE, 4),
  ('Zoning', 'map', '#ec4899', TRUE, 5),
  ('Regulatory', 'file-text', '#6366f1', TRUE, 6)
ON CONFLICT DO NOTHING;

-- ============================================
-- DEAL WORKFLOWS (instances of templates per deal)
-- ============================================
CREATE TABLE IF NOT EXISTS deal_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE RESTRICT,
  name TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deal_workflows_deal_id ON deal_workflows(deal_id);

-- ============================================
-- TASKS (project management rows in workflows)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES deal_workflows(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tasks_status_check CHECK (status IN ('not_started', 'in_progress', 'blocked', 'completed')),
  CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_id ON tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- DEAL CONTACTS (many-to-many junction)
-- ============================================
CREATE TABLE IF NOT EXISTS deal_contacts (
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  relationship TEXT,
  PRIMARY KEY (deal_id, contact_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_contacts ENABLE ROW LEVEL SECURITY;

-- Contacts policies
CREATE POLICY "Users can view own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Deals policies
CREATE POLICY "Users can view own deals" ON deals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals" ON deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals" ON deals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals" ON deals
  FOR DELETE USING (auth.uid() = user_id);

-- Workflow templates policies
CREATE POLICY "Users can view templates" ON workflow_templates
  FOR SELECT USING (is_default = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert custom templates" ON workflow_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can update own templates" ON workflow_templates
  FOR UPDATE USING (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete own templates" ON workflow_templates
  FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- Deal workflows policies
CREATE POLICY "Users can view own deal workflows" ON deal_workflows
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_workflows.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own deal workflows" ON deal_workflows
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_workflows.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can update own deal workflows" ON deal_workflows
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_workflows.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own deal workflows" ON deal_workflows
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_workflows.deal_id AND deals.user_id = auth.uid())
  );

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_workflows dw
      JOIN deals d ON d.id = dw.deal_id
      WHERE dw.id = tasks.workflow_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_workflows dw
      JOIN deals d ON d.id = dw.deal_id
      WHERE dw.id = tasks.workflow_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_workflows dw
      JOIN deals d ON d.id = dw.deal_id
      WHERE dw.id = tasks.workflow_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deal_workflows dw
      JOIN deals d ON d.id = dw.deal_id
      WHERE dw.id = tasks.workflow_id AND d.user_id = auth.uid()
    )
  );

-- Deal contacts policies
CREATE POLICY "Users can view own deal contacts" ON deal_contacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_contacts.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own deal contacts" ON deal_contacts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_contacts.deal_id AND deals.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own deal contacts" ON deal_contacts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_contacts.deal_id AND deals.user_id = auth.uid())
  );

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER FOR completed_at
-- ============================================
CREATE OR REPLACE FUNCTION update_completed_at_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_completed_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_at_column();
