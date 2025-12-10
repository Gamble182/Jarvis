#!/usr/bin/env node
/**
 * Jarvis Interactive Workflow Runner
 *
 * Supports two execution modes:
 * - Interactive Mode: Execute step-by-step with user confirmation
 * - Automatic Mode: Execute complete workflow without interruption
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { AgentLogger, LogLevel } from './agent-logger.js';
import { ContextManager } from './context-manager.js';
import { WorkflowEngine } from './workflow-engine.js';
import { ClaudeCodeAgentExecutor } from './claude-code-agent-executor.js';
import dotenv from 'dotenv';

// ESM dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(PROJECT_ROOT, '.env') });

// Initialize logger
const logger = new AgentLogger({
  logLevel: process.env.LOG_LEVEL === 'DEBUG' ? LogLevel.DEBUG : LogLevel.INFO,
  enableFileLogging: process.env.LOG_TO_FILE === 'true',
  logDirectory: process.env.LOG_DIRECTORY || './logs',
  showTimestamps: true
});

interface RunOptions {
  mode: 'interactive' | 'auto';
  projectPath: string;
  startStep?: number;
  maxSteps?: number;
  verbose: boolean;
}

class InteractiveWorkflowRunner {
  private contextManager: ContextManager;
  private workflowEngine: WorkflowEngine;
  private executor: ClaudeCodeAgentExecutor;
  private readline: any;
  private currentStepIndex: number = 0;
  private results: any[] = [];

  constructor(
    private projectPath: string,
    private options: RunOptions
  ) {
    // Initialize components
    this.contextManager = new ContextManager(projectPath);
    this.workflowEngine = new WorkflowEngine(projectPath);

    // Load project config
    const configPath = join(projectPath, 'project-config.json');
    const projectConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

    // Initialize executor (DEV_MODE)
    this.executor = new ClaudeCodeAgentExecutor(
      this.contextManager,
      this.workflowEngine,
      projectPath,
      projectConfig,
      logger
    );

    // Setup readline for interactive mode
    if (options.mode === 'interactive') {
      this.readline = createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
  }

  /**
   * Run the workflow based on mode
   */
  async run(): Promise<boolean> {
    try {
      // Load workflow
      const workflow = this.workflowEngine.loadWorkflow();

      if (!workflow || !workflow.steps || workflow.steps.length === 0) {
        logger.error('No workflow steps found', new Error('Empty workflow'));
        return false;
      }

      // Print workflow overview
      this.printWorkflowOverview(workflow);

      // Execute based on mode
      if (this.options.mode === 'interactive') {
        return await this.runInteractive(workflow);
      } else {
        return await this.runAutomatic(workflow);
      }

    } catch (error) {
      logger.error('Fatal error during workflow execution', error as Error);
      return false;
    } finally {
      if (this.readline) {
        this.readline.close();
      }
    }
  }

  /**
   * Interactive mode: Step-by-step with user confirmation
   */
  private async runInteractive(workflow: any): Promise<boolean> {
    logger.section('INTERACTIVE MODE');
    logger.info('You will be asked to confirm after each step');
    console.log('');

    const startIndex = this.options.startStep ? this.options.startStep - 1 : 0;
    const maxSteps = this.options.maxSteps || workflow.steps.length;
    const endIndex = Math.min(startIndex + maxSteps, workflow.steps.length);

    for (let i = startIndex; i < endIndex; i++) {
      const step = workflow.steps[i];
      this.currentStepIndex = i;

      // Show step info
      logger.section(`STEP ${i + 1}/${workflow.steps.length}`);
      logger.info(`Agent: ${step.agentId}`);
      logger.info(`Action: ${step.action}`);

      if (step.inputs && step.inputs.length > 0) {
        logger.info(`Inputs: ${step.inputs.join(', ')}`);
      }

      console.log('');

      // Ask for confirmation (unless it's the first step)
      if (i > startIndex) {
        const shouldContinue = await this.askToContinue(i + 1, workflow.steps.length);
        if (!shouldContinue) {
          logger.info('Workflow paused by user');
          this.printProgress(workflow, i);
          return false;
        }
      }

      // Execute step
      logger.info(`Executing step ${i + 1}...`);
      console.log('');

      const result = await this.executor.executeStep(workflow, step);
      this.results.push(result);

      // Show result
      if (result.success) {
        logger.agentSuccess(
          { id: step.agentId, name: step.agentId },
          'Step completed successfully'
        );

        // Show output preview
        if (result.output && this.options.verbose) {
          console.log('');
          logger.section('STEP OUTPUT');
          console.log(this.truncateOutput(result.output, 500));
          console.log('');
        }

        // Show stored artifacts
        const artifacts = this.contextManager.getArtifacts();
        logger.info(`Artifacts stored: ${artifacts.length}`);
        console.log('');

      } else {
        logger.agentError(
          { id: step.agentId, name: step.agentId },
          result.error || new Error('Step failed')
        );

        const shouldContinue = await this.askToContinueAfterError();
        if (!shouldContinue) {
          logger.info('Workflow stopped after error');
          this.printProgress(workflow, i + 1);
          return false;
        }
      }
    }

    // All steps completed
    logger.section('WORKFLOW COMPLETED');
    this.printFinalSummary(workflow);
    return true;
  }

  /**
   * Automatic mode: Run all steps without interruption
   */
  private async runAutomatic(workflow: any): Promise<boolean> {
    logger.section('AUTOMATIC MODE');
    logger.info('Running complete workflow without interruption');
    console.log('');

    const startIndex = this.options.startStep ? this.options.startStep - 1 : 0;
    const maxSteps = this.options.maxSteps || workflow.steps.length;

    const steps = workflow.steps.slice(startIndex, startIndex + maxSteps);

    logger.info(`Executing ${steps.length} step(s)...`);
    console.log('');

    // Execute all steps
    const results = await this.executor.executeSteps(workflow, steps);
    this.results = results;

    // Print summary
    logger.section('WORKFLOW COMPLETED');
    this.printFinalSummary(workflow);

    const allSuccessful = results.every(r => r.success);
    return allSuccessful;
  }

  /**
   * Ask user to continue to next step
   */
  private async askToContinue(currentStep: number, totalSteps: number): Promise<boolean> {
    return new Promise((resolve) => {
      const remaining = totalSteps - currentStep;
      this.readline.question(
        `\n▶️  Continue to step ${currentStep + 1}? (${remaining} step(s) remaining) [Y/n]: `,
        (answer: string) => {
          const normalized = answer.toLowerCase().trim();
          resolve(normalized !== 'n' && normalized !== 'no');
        }
      );
    });
  }

  /**
   * Ask user to continue after error
   */
  private async askToContinueAfterError(): Promise<boolean> {
    return new Promise((resolve) => {
      this.readline.question(
        `\n⚠️  An error occurred. Continue anyway? [y/N]: `,
        (answer: string) => {
          const normalized = answer.toLowerCase().trim();
          resolve(normalized === 'y' || normalized === 'yes');
        }
      );
    });
  }

  /**
   * Print workflow overview
   */
  private printWorkflowOverview(workflow: any) {
    logger.section('WORKFLOW OVERVIEW');

    const projectName = this.projectPath.split(/[\\/]/).pop() || 'Unknown';
    logger.info(`Project: ${projectName}`);
    logger.info(`Type: ${workflow.type}`);
    logger.info(`Total steps: ${workflow.steps.length}`);

    if (this.options.startStep) {
      logger.info(`Starting from step: ${this.options.startStep}`);
    }
    if (this.options.maxSteps) {
      logger.info(`Max steps to execute: ${this.options.maxSteps}`);
    }

    console.log('');

    // List all steps
    console.log('Steps:');
    workflow.steps.forEach((step: any, idx: number) => {
      const marker = this.options.startStep && idx < this.options.startStep - 1 ? '⊗' : '•';
      console.log(`  ${marker} ${idx + 1}. ${step.action}`);
    });
    console.log('');
  }

  /**
   * Print current progress
   */
  private printProgress(workflow: any, completedSteps: number) {
    logger.section('PROGRESS');

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    logger.info(`Completed: ${completedSteps}/${workflow.steps.length} steps`);
    logger.info(`Successful: ${successful}`);
    if (failed > 0) {
      logger.warn(`Failed: ${failed}`);
    }

    const artifacts = this.contextManager.getArtifacts();
    logger.info(`Artifacts: ${artifacts.length}`);
    console.log('');

    // Show where to resume
    if (completedSteps < workflow.steps.length) {
      console.log('To resume from this point, run:');
      console.log(`  npm run workflow -- --interactive --start-step ${completedSteps + 1}`);
      console.log('');
    }
  }

  /**
   * Print final summary
   */
  private printFinalSummary(workflow: any) {
    const stats = this.executor.getExecutionStats(this.results);

    logger.info(`Total steps: ${stats.totalSteps}`);
    logger.info(`Successful: ${stats.successful}`);

    if (stats.failed > 0) {
      logger.warn(`Failed: ${stats.failed}`);
    }

    logger.info(`Total time: ${(stats.totalTime / 1000).toFixed(2)}s`);
    logger.info(`Average time per step: ${(stats.averageTime / 1000).toFixed(2)}s`);
    console.log('');

    // Show artifacts
    const artifacts = this.contextManager.getArtifacts();
    logger.info(`Total artifacts created: ${artifacts.length}`);

    if (artifacts.length > 0) {
      console.log('\nArtifacts:');
      artifacts.slice(0, 5).forEach((artifact: any) => {
        console.log(`  • ${artifact.id} (${artifact.agentId})`);
      });
      if (artifacts.length > 5) {
        console.log(`  ... and ${artifacts.length - 5} more`);
      }
    }
    console.log('');

    // Show outputs location
    const outputsDir = join(this.projectPath, 'outputs');
    console.log('📁 Outputs saved to:');
    console.log(`   ${outputsDir}`);
    console.log('');

    if (stats.successful === stats.totalSteps) {
      console.log('🎉 All steps completed successfully!');
    } else {
      console.log('⚠️  Some steps failed. Check logs for details.');
    }
  }

  /**
   * Truncate output for preview
   */
  private truncateOutput(output: string, maxLength: number): string {
    if (output.length <= maxLength) {
      return output;
    }
    return output.substring(0, maxLength) + '\n\n... (truncated, see full output in artifacts)';
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let mode: 'interactive' | 'auto' = 'interactive';
  let projectPath: string | undefined;
  let startStep: number | undefined;
  let maxSteps: number | undefined;
  let verbose = false;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg === '--interactive' || arg === '-i') {
      mode = 'interactive';
    } else if (arg === '--auto' || arg === '-a') {
      mode = 'auto';
    } else if (arg === '--project' || arg === '-p') {
      projectPath = args[++i];
    } else if (arg === '--start-step' || arg === '-s') {
      startStep = parseInt(args[++i], 10);
    } else if (arg === '--max-steps' || arg === '-m') {
      maxSteps = parseInt(args[++i], 10);
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (!arg.startsWith('-')) {
      projectPath = arg;
    }
  }

  if (showHelp) {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║              JARVIS INTERACTIVE WORKFLOW RUNNER                    ║
╚════════════════════════════════════════════════════════════════════╝

Execute workflows step-by-step or automatically.

USAGE:
  npm run workflow [options] [project-name]

MODES:
  --interactive, -i    Interactive mode (default)
                       Pause after each step for confirmation

  --auto, -a           Automatic mode
                       Run complete workflow without interruption

OPTIONS:
  --project, -p <name>     Project name (in projects/active/)
  --start-step, -s <num>   Start from specific step (default: 1)
  --max-steps, -m <num>    Maximum steps to execute
  --verbose, -v            Show detailed output after each step
  --help, -h               Show this help message

EXAMPLES:
  # Interactive mode (step-by-step)
  npm run workflow -- heizungsbauer-wartungsplattform
  npm run workflow -- --interactive heizungsbauer-wartungsplattform

  # Automatic mode (complete workflow)
  npm run workflow -- --auto heizungsbauer-wartungsplattform

  # Start from specific step
  npm run workflow -- --start-step 3 heizungsbauer-wartungsplattform

  # Execute only 2 steps
  npm run workflow -- --max-steps 2 heizungsbauer-wartungsplattform

  # Verbose output with step details
  npm run workflow -- --verbose --auto heizungsbauer-wartungsplattform

INTERACTIVE MODE:
  - Execute one step at a time
  - See results immediately
  - Decide to continue or stop after each step
  - Perfect for testing and development

AUTOMATIC MODE:
  - Execute complete workflow
  - No interruptions
  - Only see final summary
  - Perfect for production runs

NOTE: Currently runs in DEV_MODE (no API key required).
      Set DEV_MODE=false in .env to use Anthropic API.
`);
    process.exit(0);
  }

  // Validate project path
  if (!projectPath) {
    console.error('❌ Error: Project name is required\n');
    console.log('Usage: npm run workflow -- <project-name>');
    console.log('Example: npm run workflow -- heizungsbauer-wartungsplattform\n');
    process.exit(1);
  }

  // Resolve project path
  const resolvedPath = resolveProjectPath(projectPath);
  if (!existsSync(resolvedPath)) {
    console.error(`❌ Error: Project not found: ${resolvedPath}\n`);
    console.log('Available projects:');
    const activeDir = join(PROJECT_ROOT, 'projects', 'active');
    if (existsSync(activeDir)) {
      const { readdirSync } = await import('fs');
      const projects = readdirSync(activeDir);
      projects.forEach(p => console.log(`  • ${p}`));
    }
    console.log('');
    process.exit(1);
  }

  // Run workflow
  const options: RunOptions = {
    mode,
    projectPath: resolvedPath,
    startStep,
    maxSteps,
    verbose: verbose || process.env.VERBOSE === 'true'
  };

  const runner = new InteractiveWorkflowRunner(resolvedPath, options);
  const success = await runner.run();

  process.exit(success ? 0 : 1);
}

/**
 * Resolve project path
 */
function resolveProjectPath(projectPath: string): string {
  if (projectPath.startsWith('/') || projectPath.includes(':\\')) {
    return projectPath;
  }

  // Try relative to projects/active/
  const activePath = join(PROJECT_ROOT, 'projects', 'active', projectPath);
  if (existsSync(activePath)) {
    return activePath;
  }

  // Try relative to PROJECT_ROOT
  const rootPath = join(PROJECT_ROOT, projectPath);
  if (existsSync(rootPath)) {
    return rootPath;
  }

  return activePath;
}

// Run CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
