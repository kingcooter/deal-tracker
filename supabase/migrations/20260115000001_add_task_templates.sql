-- Migration: Add task_templates table for automatic task creation
-- Run this in Supabase SQL Editor or via migration

-- Create task_templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  default_priority TEXT NOT NULL DEFAULT 'medium',
  sort_order INTEGER DEFAULT 0,
  CONSTRAINT task_templates_priority_check CHECK (default_priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_task_templates_workflow ON task_templates(workflow_template_id);

-- Enable RLS
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view task templates for default workflows or their own custom workflows
CREATE POLICY "Users can view task templates" ON task_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_templates wt
      WHERE wt.id = task_templates.workflow_template_id
      AND (wt.is_default = TRUE OR wt.user_id = auth.uid())
    )
  );

-- Insert default tasks for each workflow template
INSERT INTO task_templates (workflow_template_id, task, default_priority, sort_order)
SELECT wt.id, t.task, t.priority::text, t.sort_order
FROM workflow_templates wt
CROSS JOIN (VALUES
  -- Finance workflow tasks
  ('Finance', 'Secure financing commitment', 'high', 1),
  ('Finance', 'Submit loan application', 'high', 2),
  ('Finance', 'Obtain appraisal', 'medium', 3),
  ('Finance', 'Review term sheet', 'medium', 4),
  ('Finance', 'Finalize closing costs', 'low', 5),
  -- Legal workflow tasks
  ('Legal', 'Draft purchase agreement', 'high', 1),
  ('Legal', 'Review title commitment', 'high', 2),
  ('Legal', 'Negotiate amendments', 'medium', 3),
  ('Legal', 'Prepare closing documents', 'medium', 4),
  -- Due Diligence tasks
  ('Due Diligence', 'Order Phase I environmental', 'high', 1),
  ('Due Diligence', 'Complete property inspection', 'high', 2),
  ('Due Diligence', 'Review rent roll', 'medium', 3),
  ('Due Diligence', 'Verify operating expenses', 'medium', 4),
  ('Due Diligence', 'Review existing leases', 'medium', 5),
  -- Construction tasks
  ('Construction', 'Obtain building permits', 'high', 1),
  ('Construction', 'Review contractor bids', 'medium', 2),
  ('Construction', 'Create project timeline', 'medium', 3),
  ('Construction', 'Schedule inspections', 'low', 4),
  -- Zoning tasks
  ('Zoning', 'Verify current zoning', 'high', 1),
  ('Zoning', 'Review allowable uses', 'medium', 2),
  ('Zoning', 'Check setback requirements', 'low', 3),
  -- Regulatory tasks
  ('Regulatory', 'Submit permit applications', 'high', 1),
  ('Regulatory', 'Obtain certificate of occupancy', 'medium', 2),
  ('Regulatory', 'Review compliance requirements', 'medium', 3)
) AS t(workflow_name, task, priority, sort_order)
WHERE wt.name = t.workflow_name AND wt.is_default = TRUE;
