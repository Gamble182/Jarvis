import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ContextManager } from '../orchestrator/context-manager.js';
import { WorkflowEngine } from '../orchestrator/workflow-engine.js';
import { ClaudeCodeAgentExecutor } from '../orchestrator/claude-code-agent-executor.js';
import { AgentLogger, LogLevel } from '../orchestrator/agent-logger.js';
import { WorkflowPattern, ProjectConfig, WorkflowStep } from '../shared/types.js';

/**
 * Example: Execute agents using ClaudeCodeAgentExecutor (No API Key Required!)
 *
 * This example demonstrates using the Claude Code agent executor which runs
 * agents within the current Claude Code session without requiring an API key.
 *
 * Perfect for:
 * - Development and testing
 * - Learning the system
 * - Avoiding API costs
 * - Quick prototyping
 */
async function main() {
  // Initialize logger
  const logger = new AgentLogger({
    enableFileLogging: true,
    logDirectory: './logs',
    logLevel: LogLevel.INFO
  });

  logger.section('CLAUDE CODE AGENT EXECUTOR');
  logger.info('Running agents in Claude Code session - No API key required!');
  logger.info('This is perfect for development and testing.\n');

  // Configuration
  const projectPath = 'projects/demo/test-workflow';

  // Create demo project if it doesn't exist
  if (!existsSync(projectPath)) {
    logger.info('Creating demo project...');
    createDemoProject(projectPath, logger);
    logger.info('✅ Demo project created\n');
  }

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
  logger.info('🔧 Initializing components...');

  const contextManager = new ContextManager(projectPath);
  const workflowEngine = new WorkflowEngine();
  const agentExecutor = new ClaudeCodeAgentExecutor(
    contextManager,
    workflowEngine,
    projectPath,
    projectConfig,
    logger  // Pass logger to executor
  );

  logger.info('✅ Components initialized\n');

  // Display workflow info
  const progress = workflowEngine.getProgress(workflow);
  logger.section('WORKFLOW STATUS');
  logger.info(`Workflow type: ${workflow.type}`);
  logger.info(`Total steps: ${progress.total}`);
  logger.info(`Completed: ${progress.completed}`);
  logger.info(`Pending: ${progress.pending}`);
  logger.info(`Progress: ${progress.percentage}%\n`);

  // Execute single step
  logger.section('EXECUTING WORKFLOW STEP');

  const nextSteps = workflowEngine.getNextSteps(workflow);
  if (nextSteps.length > 0) {
    const firstStep = nextSteps[0];

    logger.info(`Executing: ${firstStep.action}`);
    logger.info(`Agent: ${firstStep.agentId}`);
    logger.info(`Step: ${firstStep.id}\n`);

    const result = await agentExecutor.executeStep(workflow, firstStep, {
      model: 'sonnet'
    });

    if (result.success) {
      logger.section('STEP COMPLETED SUCCESSFULLY');
      logger.info(`Output length: ${result.output?.length || 0} characters`);
      logger.info(`Execution time: ${(result.executionTime / 1000).toFixed(2)}s\n`);

      if (result.output) {
        console.log('\n📄 Agent Output:');
        console.log('─'.repeat(80));
        console.log(result.output);
        console.log('─'.repeat(80) + '\n');
      }
    } else {
      logger.section('STEP FAILED');
      logger.info(`Error: ${result.error}\n`);
    }
  } else {
    logger.info('No steps available to execute\n');
  }

  // Option to execute all steps
  logger.section('EXECUTION OPTIONS');
  logger.info('To execute all workflow steps, uncomment the code below:');
  logger.info('  const results = await agentExecutor.executeWorkflow(workflow);\n');

  /*
  // Uncomment to execute entire workflow
  logger.section('EXECUTING COMPLETE WORKFLOW');
  const allResults = await agentExecutor.executeWorkflow(workflow, {
    model: 'sonnet'
  });

  // Display final statistics
  const stats = agentExecutor.getExecutionStats(allResults);
  logger.section('FINAL STATISTICS');
  logger.info(`Total steps: ${stats.totalSteps}`);
  logger.info(`Successful: ${stats.successful}`);
  logger.info(`Failed: ${stats.failed}`);
  logger.info(`Total time: ${(stats.totalTime / 1000).toFixed(2)}s`);
  logger.info(`Avg time/step: ${(stats.averageTimePerStep / 1000).toFixed(2)}s\n`);
  */

  logger.info('✨ Execution complete!');
  logger.printSessionSummary();
}

/**
 * Create a demo project for testing
 */
function createDemoProject(projectPath: string, logger: AgentLogger): void {
  // Create project directories
  mkdirSync(projectPath, { recursive: true });
  mkdirSync(join(projectPath, 'agents'), { recursive: true });
  mkdirSync(join(projectPath, 'knowledge-base'), { recursive: true });

  // Create project config
  const projectConfig: ProjectConfig = {
    projectName: 'Demo Test Workflow',
    projectType: 'web',
    domains: ['development', 'testing'],
    requiredCapabilities: ['analysis', 'architecture', 'development'],
    phases: ['setup', 'implementation'],
    constraints: {
      technicalComplexity: 'low'
    }
  };

  writeFileSync(
    join(projectPath, 'project-config.json'),
    JSON.stringify(projectConfig, null, 2)
  );

  // Create a simple workflow
  const workflow: WorkflowPattern = {
    type: 'sequential',
    steps: [
      {
        id: 'step-1',
        action: 'Analyze project requirements',
        agentId: 'analyzer',
        inputs: [],
        outputs: ['step-1-output'],
        status: 'pending'
      },
      {
        id: 'step-2',
        action: 'Create project structure',
        agentId: 'architect',
        inputs: ['step-1-output'],
        outputs: ['step-2-output'],
        status: 'pending'
      },
      {
        id: 'step-3',
        action: 'Implement core functionality',
        agentId: 'developer',
        inputs: ['step-2-output'],
        outputs: ['step-3-output'],
        status: 'pending'
      }
    ],
    dependencies: {
      'step-1': [],
      'step-2': ['step-1'],
      'step-3': ['step-2']
    }
  };

  writeFileSync(
    join(projectPath, 'workflow.json'),
    JSON.stringify(workflow, null, 2)
  );

  // Create agent prompt files
  const analyzerPrompt = `# Analyzer Agent

You are a project analyzer agent. Your task is to analyze project requirements and provide insights.

## Your Responsibilities
1. Review the project description and requirements
2. Identify key features and functionalities
3. Assess technical requirements
4. Provide recommendations

## Output Format
Provide a structured analysis with:
- Project overview
- Key features identified
- Technical considerations
- Recommendations for next steps
`;

  const architectPrompt = `# Architect Agent

You are a system architect agent. Your task is to design the project structure.

## Your Responsibilities
1. Review the analysis from the previous step
2. Design the directory structure
3. Define component architecture
4. Create technical specifications

## Output Format
Provide:
- Proposed directory structure
- Component breakdown
- Technology stack details
- Architecture diagrams (as text)
`;

  const developerPrompt = `# Developer Agent

You are a developer agent. Your task is to implement the core functionality.

## Your Responsibilities
1. Review the architecture from the previous step
2. Implement core components
3. Write clean, maintainable code
4. Follow best practices

## Output Format
Provide:
- Implementation summary
- Code snippets for key components
- Testing considerations
- Next steps for development
`;

  writeFileSync(join(projectPath, 'agents', 'analyzer.md'), analyzerPrompt);
  writeFileSync(join(projectPath, 'agents', 'architect.md'), architectPrompt);
  writeFileSync(join(projectPath, 'agents', 'developer.md'), developerPrompt);

  logger.debug('Demo project structure created', {
    path: projectPath,
    agents: ['analyzer', 'architect', 'developer'],
    steps: 3
  });
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
