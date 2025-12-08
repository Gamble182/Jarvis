#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ProjectAnalyzer } from './project-analyzer.js';
import { CapabilityMatcher } from './capability-matcher.js';
import { AgentFactory } from './agent-factory.js';
import { WorkflowEngine } from './workflow-engine.js';
import { ContextManager } from './context-manager.js';
import { ProjectConfig } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main CLI for the Adaptive Agent System
 */
class CLI {
  private projectsPath: string;

  constructor() {
    this.projectsPath = join(__dirname, '../projects/active');

    if (!existsSync(this.projectsPath)) {
      mkdirSync(this.projectsPath, { recursive: true });
    }
  }

  /**
   * Analyze a project document
   */
  async analyzeProject(documentPath: string): Promise<void> {
    console.log('🔍 Analyzing project document...\n');

    const analyzer = new ProjectAnalyzer();
    const analysis = await analyzer.analyzeProject(documentPath);

    console.log('📊 Analysis Results:\n');
    console.log(`Project Type: ${analysis.projectType}`);
    console.log(`Domains: ${analysis.domains.join(', ')}`);
    console.log(`Complexity: ${analysis.complexity}`);
    console.log(`\nRequired Capabilities (${analysis.requiredCapabilities.length}):`);
    analysis.requiredCapabilities.forEach(cap => console.log(`  - ${cap}`));

    console.log(`\nSuggested Phases (${analysis.suggestedPhases.length}):`);
    analysis.suggestedPhases.forEach(phase => console.log(`  - ${phase}`));

    console.log(`\nExtracted Requirements (${analysis.extractedRequirements.length}):`);
    const mustHave = analysis.extractedRequirements.filter(r => r.priority === 'must-have');
    const shouldHave = analysis.extractedRequirements.filter(r => r.priority === 'should-have');
    const niceToHave = analysis.extractedRequirements.filter(r => r.priority === 'nice-to-have');

    console.log(`  Must-have: ${mustHave.length}`);
    console.log(`  Should-have: ${shouldHave.length}`);
    console.log(`  Nice-to-have: ${niceToHave.length}`);

    if (analysis.risks.length > 0) {
      console.log(`\n⚠️  Identified Risks (${analysis.risks.length}):`);
      analysis.risks.forEach(risk => console.log(`  - ${risk}`));
    }

    // Save analysis
    const analysisFile = join(__dirname, '../analysis-output.json');
    writeFileSync(analysisFile, JSON.stringify(analysis, null, 2), 'utf-8');
    console.log(`\n✅ Analysis saved to: ${analysisFile}`);
  }

  /**
   * Create a new project from a document
   */
  async createProject(documentPath: string, projectName?: string): Promise<void> {
    console.log('🚀 Creating new project...\n');

    // Step 1: Analyze the project
    const analyzer = new ProjectAnalyzer();
    const analysis = await analyzer.analyzeProject(documentPath);

    // Step 2: Create project config
    const config: ProjectConfig = {
      projectName: projectName || analysis.projectType.replace(/-/g, ' '),
      projectType: analysis.projectType,
      domains: analysis.domains,
      requiredCapabilities: analysis.requiredCapabilities,
      phases: analysis.suggestedPhases,
      constraints: {
        technicalComplexity: analysis.complexity
      }
    };

    // Extract constraints from requirements if available
    const budgetReq = analysis.extractedRequirements.find(r =>
      r.description.toLowerCase().includes('bootstrap') ||
      r.description.toLowerCase().includes('budget')
    );
    if (budgetReq) {
      config.constraints.budget = 'bootstrap';
    }

    // Step 3: Create project directory
    const projectPath = join(this.projectsPath, config.projectName.toLowerCase().replace(/\s+/g, '-'));
    if (!existsSync(projectPath)) {
      mkdirSync(projectPath, { recursive: true });
      mkdirSync(join(projectPath, 'context'), { recursive: true });
      mkdirSync(join(projectPath, 'outputs'), { recursive: true });
    }

    // Step 4: Match capabilities and create agents
    const matcher = new CapabilityMatcher();
    const { assignments, gaps, recommendations } = matcher.matchCapabilities(analysis);

    console.log(`\n🤖 Agent Team Composition (${assignments.length} agents):\n`);
    assignments.forEach((assignment, index) => {
      console.log(`${index + 1}. Agent ${assignment.agentId}`);
      console.log(`   Capabilities: ${assignment.capabilities.join(', ')}`);
      console.log(`   Phase: ${assignment.phase}`);
      console.log(`   Context: ${assignment.context}\n`);
    });

    if (gaps.length > 0) {
      console.log(`⚠️  Capability Gaps (${gaps.length}):`);
      gaps.forEach(gap => console.log(`  - ${gap}`));
      console.log('');
    }

    if (recommendations.length > 0) {
      console.log(`💡 Recommendations:`);
      recommendations.forEach(rec => console.log(`  - ${rec}`));
      console.log('');
    }

    // Step 5: Create agent specifications
    const factory = new AgentFactory(matcher);
    const agents = factory.createAgents(assignments, config);
    factory.saveAgentSpecs(agents, projectPath);

    // Step 6: Create workflow
    const workflowEngine = new WorkflowEngine();
    const workflow = workflowEngine.createWorkflow(agents, config.phases, 'sequential');

    // Step 7: Save project files
    const configFile = join(projectPath, 'project-config.json');
    writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');

    const analysisFile = join(projectPath, 'project-analysis.json');
    writeFileSync(analysisFile, JSON.stringify(analysis, null, 2), 'utf-8');

    const workflowFile = join(projectPath, 'workflow.json');
    writeFileSync(workflowFile, JSON.stringify(workflow, null, 2), 'utf-8');

    console.log(`✅ Project created successfully!`);
    console.log(`📁 Project path: ${projectPath}`);
    console.log(`\nNext steps:`);
    console.log(`1. Review the generated agent specifications in ${projectPath}/agents/`);
    console.log(`2. Review the project configuration in ${configFile}`);
    console.log(`3. Start executing the workflow phases`);
    console.log(`4. Use the context manager to store and share knowledge between agents\n`);
  }

  /**
   * List all active projects
   */
  listProjects(): void {
    console.log('📂 Active Projects:\n');

    if (!existsSync(this.projectsPath)) {
      console.log('No projects found.');
      return;
    }

    const projects = readdirSync(this.projectsPath);

    if (projects.length === 0) {
      console.log('No projects found.');
      return;
    }

    projects.forEach((project, index) => {
      const projectPath = join(this.projectsPath, project);
      const configFile = join(projectPath, 'project-config.json');

      if (existsSync(configFile)) {
        const config = JSON.parse(readFileSync(configFile, 'utf-8')) as ProjectConfig;
        console.log(`${index + 1}. ${config.projectName}`);
        console.log(`   Type: ${config.projectType}`);
        console.log(`   Domains: ${config.domains.join(', ')}`);
        console.log(`   Phases: ${config.phases.join(' → ')}\n`);
      }
    });
  }

  /**
   * Show help
   */
  showHelp(): void {
    console.log(`
Adaptive Agent System CLI

Usage:
  npm run analyze <document-path>              Analyze a project document
  npm run create-project <document-path> [name] Create a new project
  npm run list                                 List all active projects

Examples:
  npm run analyze ../projectidea.md
  npm run create-project ../projectidea.md "Heizungsbauer Platform"
  npm run list

For more information, see the documentation in the README.md file.
    `);
  }
}

// Main entry point
const cli = new CLI();
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'analyze':
    if (args[1]) {
      await cli.analyzeProject(args[1]);
    } else {
      console.error('Error: Document path required');
      console.log('Usage: npm run analyze <document-path>');
    }
    break;

  case 'create-project':
    if (args[1]) {
      await cli.createProject(args[1], args[2]);
    } else {
      console.error('Error: Document path required');
      console.log('Usage: npm run create-project <document-path> [name]');
    }
    break;

  case 'list':
    cli.listProjects();
    break;

  case 'help':
  case '--help':
  case '-h':
    cli.showHelp();
    break;

  default:
    console.log('Unknown command. Use "help" for usage information.');
    cli.showHelp();
}
