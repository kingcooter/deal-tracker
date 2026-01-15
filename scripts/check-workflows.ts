import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cggbycvcnehnuommyqjw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWorkflows() {
  // Get all deals
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (dealsError) {
    console.error('Error fetching deals:', dealsError);
    return;
  }

  console.log('\n=== Recent Deals ===');
  for (const deal of deals || []) {
    console.log(`\n${deal.name} (${deal.id})`);
    console.log(`  Created: ${deal.created_at}`);

    // Get workflows for this deal
    const { data: workflows, error: workflowError } = await supabase
      .from('deal_workflows')
      .select('id, name, template_id')
      .eq('deal_id', deal.id);

    if (workflowError) {
      console.log(`  Error fetching workflows: ${workflowError.message}`);
      continue;
    }

    console.log(`  Workflows: ${workflows?.length || 0}`);
    if (workflows && workflows.length > 0) {
      workflows.forEach(w => console.log(`    - ${w.name}`));

      // Get tasks for these workflows
      const workflowIds = workflows.map(w => w.id);
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id, task')
        .in('workflow_id', workflowIds);

      if (taskError) {
        console.log(`  Error fetching tasks: ${taskError.message}`);
      } else {
        console.log(`  Tasks: ${tasks?.length || 0}`);
      }
    }
  }
}

checkWorkflows();
