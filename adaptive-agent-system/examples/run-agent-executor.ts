import { readFileSync } from 'fs';
import { join } from 'path';
import { ContextManager } from '../orchestrator/context-manager.js';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';
import { AgentExecutor } from '../orchestrator/agent-executor.js';
import { WorkflowPattern, ProjectConfig } from '../shared/types.js';

/**
 * Example: Execute agents using AgentExecutor
 */
async function main() {
  // Configuration
  const projectPath = 'projects/active/heizungsbauer-wartungsplattform';

  // Load project config
  const projectConfigPath = join(projectPath, 'project-config.json');
  const projectConfig: ProjectConfig = JSON.parse(
    readFileSync(projectConfigPath, 'utf-8')
  );

  // Load workflow
  const workflowPath = join(projectPath, 'workflow.json');
  const workflow: WorkflowPattern = JSON.parse(
    readFileSync(workflowPath, 'utf-8')
  );

  // Initialize components
  console.log('🔧 Initializing components...\n');

  const contextManager = new ContextManager(projectPath);
  const workflowEngine = new WorkflowEngine();
  const agentExecutor = new AgentExecutor(
    contextManager,
    workflowEngine,
    projectPath,
    projectConfig
  );

  console.log('✅ Components initialized\n');

  // Display workflow info
  const progress = workflowEngine.getProgress(workflow);
  console.log('📊 Workflow Status:');
  console.log(`   Total steps: ${progress.total}`);
  console.log(`   Completed: ${progress.completed}`);
  console.log(`   Pending: ${progress.pending}`);
  console.log(`   Progress: ${progress.percentage}%\n`);

  // Option 1: Execute single step
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Option 1: Execute single step');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const nextSteps = workflowEngine.getNextSteps(workflow);
  if (nextSteps.length > 0) {
    const firstStep = nextSteps[0];
    const result = await agentExecutor.executeStep(workflow, firstStep, {
      maxTokens: 4096,
      temperature: 1.0
    });

    if (result.success) {
      console.log('\n📄 Agent Output Preview:');
      console.log('─'.repeat(80));
      console.log(result.output?.substring(0, 500) + '...');
      console.log('─'.repeat(80));
    }
  }

  // Option 2: Execute next available steps
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Option 2: Execute all next available steps');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const availableSteps = workflowEngine.getNextSteps(workflow);
  if (availableSteps.length > 0) {
    const results = await agentExecutor.executeSteps(workflow, availableSteps);

    // Display statistics
    const stats = agentExecutor.getExecutionStats(results);
    console.log('\n📈 Execution Statistics:');
    console.log(`   Success rate: ${stats.successful}/${stats.totalSteps}`);
    console.log(`   Total time: ${(stats.totalTime / 1000).toFixed(2)}s`);
    console.log(`   Total tokens: ${stats.totalTokens}`);
    console.log(`   Avg time/step: ${(stats.averageTimePerStep / 1000).toFixed(2)}s`);
    console.log(`   Avg tokens/step: ${Math.round(stats.averageTokensPerStep)}`);
  }

  // Option 3: Execute entire workflow
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Option 3: Execute entire workflow (commented out for safety)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  /*
  // Uncomment to execute the entire workflow
  const allResults = await agentExecutor.executeWorkflow(workflow, {
    maxTokens: 4096,
    temperature: 1.0
  });

  // Final statistics
  const finalStats = agentExecutor.getExecutionStats(allResults);
  console.log('\n🎯 Final Workflow Statistics:');
  console.log(`   Success rate: ${finalStats.successful}/${finalStats.totalSteps}`);
  console.log(`   Failed: ${finalStats.failed}`);
  console.log(`   Total time: ${(finalStats.totalTime / 1000).toFixed(2)}s`);
  console.log(`   Total tokens: ${finalStats.totalTokens}`);
  console.log(`   Avg time/step: ${(finalStats.averageTimePerStep / 1000).toFixed(2)}s`);
  console.log(`   Avg tokens/step: ${Math.round(finalStats.averageTokensPerStep)}`);

  // Display context summary
  const contextSummary = contextManager.exportSummary();
  console.log('\n📦 Knowledge Base Summary:');
  console.log(`   Total artifacts: ${contextSummary.totalArtifacts}`);
  console.log(`   Artifacts by type:`, contextSummary.artifactsByType);
  console.log(`   Artifacts by agent:`, contextSummary.artifactsByAgent);
  */

  console.log('\n✨ Execution complete!\n');
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
