#!/usr/bin/env node
/**
 * Jarvis Execution Readiness Test
 *
 * Tests if the system is ready for agent execution in both modes:
 * - Development Mode (DEV_MODE=true): No API key required, uses Claude Code
 * - Production Mode (DEV_MODE=false): Requires API key, uses Anthropic API
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AgentLogger, LogLevel } from './agent-logger.js';
import dotenv from 'dotenv';

// ESM dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(PROJECT_ROOT, '.env') });

// Initialize logger
const logger = new AgentLogger({
  logLevel: LogLevel.INFO,
  enableFileLogging: false,
  showTimestamps: true
});

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  solution?: string;
  warning?: boolean;
}

class ExecutionTester {
  private results: TestResult[] = [];
  private projectPath?: string;
  private devMode: boolean;

  constructor(projectPath?: string) {
    this.projectPath = projectPath;
    this.devMode = process.env.DEV_MODE === 'true';
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<boolean> {
    logger.section('JARVIS EXECUTION READINESS TEST');

    // Show current mode
    if (this.devMode) {
      logger.info('🔧 Running in DEVELOPMENT MODE');
      logger.info('   → No API key required');
      logger.info('   → Uses Claude Code Agent Executor');
    } else {
      logger.info('🚀 Running in PRODUCTION MODE');
      logger.info('   → API key required');
      logger.info('   → Uses Anthropic API Agent Executor');
    }

    console.log('');

    // Run tests
    this.testEnvironmentFile();
    this.testApiKey();
    this.testDependencies();
    this.testProjectStructure();

    if (this.projectPath) {
      this.testProjectExists();
      this.testAgentFiles();
      this.testWorkflowFile();
      this.testContextDirectory();
    }

    this.testLogger();

    // Print results
    return this.printResults();
  }

  /**
   * Test 1: Check if .env file exists
   */
  private testEnvironmentFile() {
    const envPath = join(PROJECT_ROOT, '.env');
    const envExamplePath = join(PROJECT_ROOT, '.env.example');

    if (existsSync(envPath)) {
      this.addResult({
        name: 'Environment File',
        passed: true,
        message: '.env file exists'
      });
    } else {
      this.addResult({
        name: 'Environment File',
        passed: false,
        message: '.env file not found',
        solution: existsSync(envExamplePath)
          ? 'Run: cp .env.example .env'
          : 'Create .env file with required variables'
      });
    }
  }

  /**
   * Test 2: Check API key (only in production mode)
   */
  private testApiKey() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (this.devMode) {
      // In dev mode, API key is optional
      if (apiKey && apiKey !== 'your-api-key-here') {
        this.addResult({
          name: 'API Key (Optional)',
          passed: true,
          message: 'API key set (not required in DEV_MODE)',
          warning: true
        });
      } else {
        this.addResult({
          name: 'API Key (Optional)',
          passed: true,
          message: 'No API key - using DEV_MODE (Claude Code)',
          warning: true
        });
      }
    } else {
      // In production mode, API key is required
      if (!apiKey || apiKey === 'your-api-key-here') {
        this.addResult({
          name: 'API Key (Required)',
          passed: false,
          message: 'ANTHROPIC_API_KEY not set or using placeholder',
          solution: 'Set your API key in .env file:\n' +
                   '   Get it from: https://console.anthropic.com/settings/keys\n' +
                   '   Or enable DEV_MODE=true in .env for local development'
        });
      } else if (apiKey.startsWith('sk-ant-')) {
        this.addResult({
          name: 'API Key (Required)',
          passed: true,
          message: 'Valid API key format detected'
        });
      } else {
        this.addResult({
          name: 'API Key (Required)',
          passed: false,
          message: 'API key has invalid format (should start with "sk-ant-")',
          solution: 'Check your API key in .env file'
        });
      }
    }
  }

  /**
   * Test 3: Check dependencies
   */
  private testDependencies() {
    try {
      const packageJson = JSON.parse(
        readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      const requiredDeps = ['@anthropic-ai/sdk', 'chalk', 'dotenv', 'zod'];
      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

      if (missingDeps.length === 0) {
        this.addResult({
          name: 'Dependencies',
          passed: true,
          message: 'All required dependencies installed'
        });
      } else {
        this.addResult({
          name: 'Dependencies',
          passed: false,
          message: `Missing dependencies: ${missingDeps.join(', ')}`,
          solution: 'Run: npm install'
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Dependencies',
        passed: false,
        message: 'Could not read package.json',
        solution: 'Ensure you are in the correct directory'
      });
    }
  }

  /**
   * Test 4: Check project structure
   */
  private testProjectStructure() {
    const requiredDirs = [
      'orchestrator',
      'agent-pool',
      'projects',
      'shared'
    ];

    const missingDirs = requiredDirs.filter(dir =>
      !existsSync(join(PROJECT_ROOT, dir))
    );

    if (missingDirs.length === 0) {
      this.addResult({
        name: 'Project Structure',
        passed: true,
        message: 'All core directories exist'
      });
    } else {
      this.addResult({
        name: 'Project Structure',
        passed: false,
        message: `Missing directories: ${missingDirs.join(', ')}`,
        solution: 'Project structure is incomplete'
      });
    }
  }

  /**
   * Test 5: Check if project exists
   */
  private testProjectExists() {
    if (!this.projectPath) return;

    const fullPath = this.resolveProjectPath(this.projectPath);

    if (existsSync(fullPath)) {
      this.addResult({
        name: 'Project Directory',
        passed: true,
        message: `Project found: ${this.projectPath}`
      });
    } else {
      this.addResult({
        name: 'Project Directory',
        passed: false,
        message: `Project not found: ${fullPath}`,
        solution: 'Create project first:\n' +
                 '   npm run create-project <path-to-idea.md> "<Project Name>"'
      });
    }
  }

  /**
   * Test 6: Check agent files
   */
  private testAgentFiles() {
    if (!this.projectPath) return;

    const fullPath = this.resolveProjectPath(this.projectPath);
    const agentsDir = join(fullPath, 'agents');

    if (!existsSync(agentsDir)) {
      this.addResult({
        name: 'Agent Files',
        passed: false,
        message: 'agents/ directory not found',
        solution: 'Project may be incomplete or corrupted'
      });
      return;
    }

    const agentFiles = readdirSync(agentsDir)
      .filter(f => f.endsWith('.md'));

    if (agentFiles.length > 0) {
      this.addResult({
        name: 'Agent Files',
        passed: true,
        message: `Found ${agentFiles.length} agent(s): ${agentFiles.slice(0, 3).join(', ')}${agentFiles.length > 3 ? '...' : ''}`
      });
    } else {
      this.addResult({
        name: 'Agent Files',
        passed: false,
        message: 'No agent files (.md) found in agents/ directory',
        solution: 'Re-run project creation or add agent files manually'
      });
    }
  }

  /**
   * Test 7: Check workflow file
   */
  private testWorkflowFile() {
    if (!this.projectPath) return;

    const fullPath = this.resolveProjectPath(this.projectPath);
    const workflowPath = join(fullPath, 'workflow.json');

    if (!existsSync(workflowPath)) {
      this.addResult({
        name: 'Workflow File',
        passed: false,
        message: 'workflow.json not found',
        solution: 'Project may be incomplete'
      });
      return;
    }

    try {
      const workflow = JSON.parse(readFileSync(workflowPath, 'utf-8'));

      // Validate workflow structure
      if (!workflow.type || !workflow.steps || !Array.isArray(workflow.steps)) {
        this.addResult({
          name: 'Workflow File',
          passed: false,
          message: 'workflow.json has invalid structure',
          solution: 'Workflow must have "type" and "steps" array'
        });
        return;
      }

      if (workflow.steps.length === 0) {
        this.addResult({
          name: 'Workflow File',
          passed: false,
          message: 'workflow.json has no steps defined',
          solution: 'Add workflow steps to workflow.json'
        });
        return;
      }

      this.addResult({
        name: 'Workflow File',
        passed: true,
        message: `Valid workflow with ${workflow.steps.length} step(s) (${workflow.type})`
      });
    } catch (error) {
      this.addResult({
        name: 'Workflow File',
        passed: false,
        message: 'workflow.json is not valid JSON',
        solution: 'Fix JSON syntax errors in workflow.json'
      });
    }
  }

  /**
   * Test 8: Check context directory
   */
  private testContextDirectory() {
    if (!this.projectPath) return;

    const fullPath = this.resolveProjectPath(this.projectPath);
    const contextDir = join(fullPath, 'context');

    if (existsSync(contextDir) && statSync(contextDir).isDirectory()) {
      this.addResult({
        name: 'Context Directory',
        passed: true,
        message: 'context/ directory exists and ready'
      });
    } else {
      this.addResult({
        name: 'Context Directory',
        passed: true,
        message: 'context/ directory will be created on first execution',
        warning: true
      });
    }
  }

  /**
   * Test 9: Test logger functionality
   */
  private testLogger() {
    try {
      const testLogger = new AgentLogger({
        logLevel: LogLevel.INFO,
        enableFileLogging: false
      });

      testLogger.debug('Logger test', { test: true });

      this.addResult({
        name: 'Logger System',
        passed: true,
        message: 'AgentLogger initialized successfully'
      });
    } catch (error) {
      this.addResult({
        name: 'Logger System',
        passed: false,
        message: 'Failed to initialize AgentLogger',
        solution: 'Check orchestrator/agent-logger.ts'
      });
    }
  }

  /**
   * Add a test result
   */
  private addResult(result: TestResult) {
    this.results.push(result);
  }

  /**
   * Print all results and return overall status
   */
  private printResults(): boolean {
    console.log('');
    logger.section('TEST RESULTS');

    let allPassed = true;
    let warningCount = 0;

    for (const result of this.results) {
      const icon = result.passed
        ? (result.warning ? '⚠️' : '✅')
        : '❌';

      const status = result.passed
        ? (result.warning ? 'WARNING' : 'PASS')
        : 'FAIL';

      console.log(`${icon} [${status}] ${result.name}`);
      console.log(`   ${result.message}`);

      if (result.solution) {
        console.log(`   💡 Solution: ${result.solution.split('\n').join('\n      ')}`);
      }

      if (!result.passed) {
        allPassed = false;
      }

      if (result.warning) {
        warningCount++;
      }

      console.log('');
    }

    // Summary
    logger.section('SUMMARY');

    const passedCount = this.results.filter(r => r.passed && !r.warning).length;
    const failedCount = this.results.filter(r => !r.passed).length;
    const totalCount = this.results.length;

    console.log(`✅ Passed:   ${passedCount}/${totalCount}`);
    console.log(`❌ Failed:   ${failedCount}/${totalCount}`);
    if (warningCount > 0) {
      console.log(`⚠️  Warnings: ${warningCount}`);
    }
    console.log('');

    if (allPassed) {
      console.log('🎉 SUCCESS: Jarvis is ready for execution!\n');

      if (this.devMode) {
        console.log('📝 To execute agents (DEV MODE):');
        console.log('   npm run execute-claude-code');
      } else {
        console.log('📝 To execute agents (PRODUCTION MODE):');
        console.log('   npm run execute-agents');
      }

      if (this.projectPath) {
        console.log(`   -- Or for specific project --`);
        console.log(`   npm run execute -- --project "${this.projectPath}"`);
      }
    } else {
      console.log('❌ FAILED: Please fix the issues above before execution.\n');
    }

    return allPassed;
  }

  /**
   * Resolve project path (relative or absolute)
   */
  private resolveProjectPath(projectPath: string): string {
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

    return activePath; // Return first attempt for error message
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let projectPath: string | undefined;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg === '--project' || arg === '-p') {
      projectPath = args[++i];
    } else if (!arg.startsWith('-')) {
      projectPath = arg;
    }
  }

  if (showHelp) {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                 JARVIS EXECUTION READINESS TEST                    ║
╚════════════════════════════════════════════════════════════════════╝

Tests if Jarvis is ready for agent execution.

USAGE:
  npm run test-execution                          # Test system readiness
  npm run test-execution -- <project-name>        # Test specific project
  npm run test-execution -- --project <name>      # Test specific project

EXAMPLES:
  npm run test-execution
  npm run test-execution -- heizungsbauer-wartungsplattform
  npm run test-execution -- --project my-saas-app

OPTIONS:
  --project, -p <name>    Project name to test (in projects/active/)
  --help, -h              Show this help message

MODES:
  Development Mode (DEV_MODE=true):
    - No API key required
    - Uses Claude Code Agent Executor locally
    - Perfect for testing and development

  Production Mode (DEV_MODE=false):
    - API key required
    - Uses Anthropic API Agent Executor
    - For production deployments

Set DEV_MODE in your .env file to switch between modes.
`);
    process.exit(0);
  }

  // Run tests
  const tester = new ExecutionTester(projectPath);
  const success = await tester.runAllTests();

  process.exit(success ? 0 : 1);
}

// Run CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
