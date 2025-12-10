import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ContextManager } from '../orchestrator/context-manager.js';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';
import { AgentExecutor } from '../orchestrator/agent-executor.js';
import { ClaudeCodeAgentExecutor } from '../orchestrator/claude-code-agent-executor.js';
import { AgentLogger, LogLevel } from '../orchestrator/agent-logger.js';
import { WorkflowPattern, ProjectConfig } from '../shared/types.js';

/**
 * Execution mode: API or Claude Code
 * - 'api': Uses Anthropic API (requires API key, costs money, production-ready)
 * - 'claude-code': Uses Claude Code Task tool (free, no API key, dev/testing)
 */
const EXECUTION_MODE: 'api' | 'claude-code' = 'claude-code';

/**
 * Example: Execute agents with configurable executor
 *
 * This example supports two execution modes:
 * 1. API Mode: Uses Anthropic API (production)
 * 2. Claude Code Mode: Uses Task tool (development)
 *
 * Switch between modes by changing EXECUTION_MODE constant above.
 */
async function main() {
  // Initialize logger
  const logger = new AgentLogger({
    enableFileLogging: true,
    logDirectory: './logs',
    logLevel: LogLevel.INFO
  });

  logger.section('AGENT EXECUTOR EXAMPLE');
  logger.info(`Execution Mode: ${EXECUTION_MODE.toUpperCase()}`);

  if (EXECUTION_MODE === 'api') {
    logger.info('Using Anthropic API (requires API key)\n');
  } else {
    logger.info('Using Claude Code Task tool (no API key required)\n');
  }

  // Check for API key only if using API mode
  if (EXECUTION_MODE === 'api' && !process.env.ANTHROPIC_API_KEY) {
    logger.info('⚠️  ANTHROPIC_API_KEY not found in environment');
    logger.info('This example requires an Anthropic API key when using API mode.');
    logger.info('\nOptions:');
    logger.info('  1. Switch to Claude Code mode (set EXECUTION_MODE = "claude-code")');
    logger.info('  2. Or get an API key from: https://console.anthropic.com/');
    logger.info('     Set environment: export ANTHROPIC_API_KEY=your-key-here\n');
    logger.info('💡 TIP: For development, use Claude Code mode (free, no API key needed)\n');
    logger.info('Exiting gracefully...\n');
    return;
  }

  // Configuration
  const projectPath = 'projects/active/heizungsbauer-wartungsplattform';

  // Check if project exists
  if (!existsSync(projectPath)) {
    logger.info(`⚠️  Project path not found: ${projectPath}`);
    logger.info('Please create a project first using the CLI:');
    logger.info('  npm run create-project\n');
    return;
  }

  // Load project config
  const projectConfigPath = join(projectPath, 'project-config.json');
  if (!existsSync(projectConfigPath)) {
    logger.info(`⚠️  Project config not found: ${projectConfigPath}`);
    logger.info('Please ensure the project has been properly initialized.\n');
    return;
  }

  const projectConfig: ProjectConfig = JSON.parse(
    readFileSync(projectConfigPath, 'utf-8')
  );

  // Load workflow
  const workflowPath = join(projectPath, 'workflow.json');
  if (!existsSync(workflowPath)) {
    logger.info(`⚠️  Workflow file not found: ${workflowPath}`);
    logger.info('Please ensure the project has a workflow.json file.\n');
    return;
  }

  const workflow: WorkflowPattern = JSON.parse(
    readFileSync(workflowPath, 'utf-8')
  );

  // Initialize components
  logger.info('🔧 Initializing components...');

  const contextManager = new ContextManager(projectPath);
  const workflowEngine = new WorkflowEngine();

  // Initialize executor based on mode
  const agentExecutor = EXECUTION_MODE === 'api'
    ? new AgentExecutor(
        contextManager,
        workflowEngine,
        projectPath,
        projectConfig
      )
    : new ClaudeCodeAgentExecutor(
        contextManager,
        workflowEngine,
        projectPath,
        projectConfig,
        logger
      );

  logger.info('✅ Components initialized');
  logger.info(`   Executor type: ${EXECUTION_MODE === 'api' ? 'Anthropic API' : 'Claude Code Task'}\n`);

  // Display workflow info
  const progress = workflowEngine.getProgress(workflow);
  logger.section('WORKFLOW STATUS');
  logger.info(`Total steps: ${progress.total}`);
  logger.info(`Completed: ${progress.completed}`);
  logger.info(`Pending: ${progress.pending}`);
  logger.info(`Progress: ${progress.percentage}%\n`);

  // Option 1: Execute single step
  logger.section('OPTION 1: Execute Single Step');

  const nextSteps = workflowEngine.getNextSteps(workflow);
  if (nextSteps.length > 0) {
    const firstStep = nextSteps[0];

    const agent = {
      id: firstStep.agentId,
      name: firstStep.action,
      type: 'workflow-agent'
    };

    logger.agentStart(agent, `Executing step: ${firstStep.id}`);
    logger.agentAction(agent, 'Preparing execution', {
      maxTokens: 4096,
      temperature: 1.0
    });

    const result = await agentExecutor.executeStep(workflow, firstStep, {
      maxTokens: 4096,
      temperature: 1.0
    });

    if (result.success) {
      logger.agentOutput(agent, {
        stepId: result.stepId,
        tokensUsed: result.tokensUsed,
        executionTime: `${(result.executionTime / 1000).toFixed(2)}s`
      }, 'Execution Result');

      if (result.output) {
        logger.info('\n📄 Agent Output Preview:');
        console.log('─'.repeat(80));
        console.log(result.output.substring(0, 500) + '...');
        console.log('─'.repeat(80));
      }

      logger.agentSuccess(agent, 'Step completed successfully');
    } else {
      logger.agentError(agent, result.error || 'Unknown error', {
        stepId: result.stepId,
        executionTime: `${(result.executionTime / 1000).toFixed(2)}s`
      });
    }
  } else {
    logger.info('No steps available to execute\n');
  }

  // Option 2: Execute next available steps
  logger.section('OPTION 2: Execute All Next Available Steps');

  const availableSteps = workflowEngine.getNextSteps(workflow);
  if (availableSteps.length > 0) {
    logger.info(`Found ${availableSteps.length} steps ready to execute\n`);

    const results = await agentExecutor.executeSteps(workflow, availableSteps);

    // Display statistics
    const stats = agentExecutor.getExecutionStats(results);
    logger.section('EXECUTION STATISTICS');
    logger.info(`Success rate: ${stats.successful}/${stats.totalSteps}`);
    logger.info(`Total time: ${(stats.totalTime / 1000).toFixed(2)}s`);
    logger.info(`Total tokens: ${stats.totalTokens}`);
    logger.info(`Avg time/step: ${(stats.averageTimePerStep / 1000).toFixed(2)}s`);
    logger.info(`Avg tokens/step: ${Math.round(stats.averageTokensPerStep)}\n`);
  } else {
    logger.info('No steps available to execute\n');
  }

  // Option 3: Execute entire workflow
  logger.section('OPTION 3: Execute Entire Workflow');
  logger.info('This option is commented out for safety.');
  logger.info('Uncomment in the source code to execute the entire workflow.\n');

  /*
  // Uncomment to execute the entire workflow
  logger.section('EXECUTING ENTIRE WORKFLOW');

  const allResults = await agentExecutor.executeWorkflow(workflow, {
    maxTokens: 4096,
    temperature: 1.0
  });

  // Final statistics
  const finalStats = agentExecutor.getExecutionStats(allResults);
  logger.section('FINAL WORKFLOW STATISTICS');
  logger.info(`Success rate: ${finalStats.successful}/${finalStats.totalSteps}`);
  logger.info(`Failed: ${finalStats.failed}`);
  logger.info(`Total time: ${(finalStats.totalTime / 1000).toFixed(2)}s`);
  logger.info(`Total tokens: ${finalStats.totalTokens}`);
  logger.info(`Avg time/step: ${(finalStats.averageTimePerStep / 1000).toFixed(2)}s`);
  logger.info(`Avg tokens/step: ${Math.round(finalStats.averageTokensPerStep)}\n`);

  // Display context summary
  const contextSummary = contextManager.exportSummary();
  logger.section('KNOWLEDGE BASE SUMMARY');
  logger.info(`Total artifacts: ${contextSummary.totalArtifacts}`);
  logger.info(`Artifacts by type: ${JSON.stringify(contextSummary.artifactsByType)}`);
  logger.info(`Artifacts by agent: ${JSON.stringify(contextSummary.artifactsByAgent)}\n`);
  */

  logger.info('✨ Execution complete!');
  logger.printSessionSummary();
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
