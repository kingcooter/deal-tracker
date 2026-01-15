import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cggbycvcnehnuommyqjw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  // Get workflow templates
  const { data: templates, error: templatesError } = await supabase
    .from('workflow_templates')
    .select('id, name')
    .eq('is_default', true);

  if (templatesError) {
    console.error('Error fetching templates:', templatesError);
    return;
  }

  console.log('Found templates:', templates.map(t => t.name));

  // Check if task_templates table exists
  const { data: existing, error: existError } = await supabase
    .from('task_templates')
    .select('id')
    .limit(1);

  if (existError) {
    console.error('task_templates table does not exist:', existError.message);
    console.log('\n=== MIGRATION REQUIRED ===');
    console.log('Please run the SQL from: supabase/migrations/20260115000001_add_task_templates.sql');
    console.log('In Supabase SQL Editor: https://supabase.com/dashboard/project/cggbycvcnehnuommyqjw/sql/new');
    return;
  }

  console.log('task_templates table exists!');

  // Check if already has data
  const { data: existingData } = await supabase
    .from('task_templates')
    .select('id');

  if (existingData && existingData.length > 0) {
    console.log('Task templates already exist (' + existingData.length + ' records)');
    return;
  }

  // Insert task templates
  const taskData = [
    { workflow: 'Finance', task: 'Secure financing commitment', priority: 'high', sort_order: 1 },
    { workflow: 'Finance', task: 'Submit loan application', priority: 'high', sort_order: 2 },
    { workflow: 'Finance', task: 'Obtain appraisal', priority: 'medium', sort_order: 3 },
    { workflow: 'Finance', task: 'Review term sheet', priority: 'medium', sort_order: 4 },
    { workflow: 'Finance', task: 'Finalize closing costs', priority: 'low', sort_order: 5 },
    { workflow: 'Legal', task: 'Draft purchase agreement', priority: 'high', sort_order: 1 },
    { workflow: 'Legal', task: 'Review title commitment', priority: 'high', sort_order: 2 },
    { workflow: 'Legal', task: 'Negotiate amendments', priority: 'medium', sort_order: 3 },
    { workflow: 'Legal', task: 'Prepare closing documents', priority: 'medium', sort_order: 4 },
    { workflow: 'Due Diligence', task: 'Order Phase I environmental', priority: 'high', sort_order: 1 },
    { workflow: 'Due Diligence', task: 'Complete property inspection', priority: 'high', sort_order: 2 },
    { workflow: 'Due Diligence', task: 'Review rent roll', priority: 'medium', sort_order: 3 },
    { workflow: 'Due Diligence', task: 'Verify operating expenses', priority: 'medium', sort_order: 4 },
    { workflow: 'Due Diligence', task: 'Review existing leases', priority: 'medium', sort_order: 5 },
    { workflow: 'Construction', task: 'Obtain building permits', priority: 'high', sort_order: 1 },
    { workflow: 'Construction', task: 'Review contractor bids', priority: 'medium', sort_order: 2 },
    { workflow: 'Construction', task: 'Create project timeline', priority: 'medium', sort_order: 3 },
    { workflow: 'Construction', task: 'Schedule inspections', priority: 'low', sort_order: 4 },
    { workflow: 'Zoning', task: 'Verify current zoning', priority: 'high', sort_order: 1 },
    { workflow: 'Zoning', task: 'Review allowable uses', priority: 'medium', sort_order: 2 },
    { workflow: 'Zoning', task: 'Check setback requirements', priority: 'low', sort_order: 3 },
    { workflow: 'Regulatory', task: 'Submit permit applications', priority: 'high', sort_order: 1 },
    { workflow: 'Regulatory', task: 'Obtain certificate of occupancy', priority: 'medium', sort_order: 2 },
    { workflow: 'Regulatory', task: 'Review compliance requirements', priority: 'medium', sort_order: 3 },
  ];

  const inserts = taskData.map(t => {
    const template = templates.find(tmpl => tmpl.name === t.workflow);
    if (!template) {
      console.log('No template found for:', t.workflow);
      return null;
    }
    return {
      workflow_template_id: template.id,
      task: t.task,
      default_priority: t.priority,
      sort_order: t.sort_order
    };
  }).filter(Boolean);

  console.log('Inserting', inserts.length, 'task templates...');

  const { error } = await supabase
    .from('task_templates')
    .insert(inserts);

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Successfully inserted task templates!');
  }
}

runMigration();
