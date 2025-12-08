import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ContextManager } from './context-manager.js';
import { WorkflowPattern, WorkflowStep, ProjectConfig } from '../shared/types.js';
import { WorkflowEngine } from './workflow-engine.js';

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  stepId: string;
  agentId: string;
  success: boolean;
  output?: string;
  error?: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  executionTime: number;
}

/**
 * Agent execution options
 */
export interface ExecutionOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  streaming?: boolean;
  timeout?: number;
}

/**
 * AgentExecutor - Executes agents by calling Claude API
 *
 * This component:
 * - Loads agent prompts from markdown files
 * - Retrieves context from ContextManager
 * - Calls Claude API with agent prompts
 * - Parses and stores responses
 * - Marks workflow steps as completed
 * - Provides live logging
 */
export class AgentExecutor {
  private anthropic: Anthropic;
  private contextManager: ContextManager;
  private workflowEngine: WorkflowEngine;
  private projectPath: string;
  private projectConfig: ProjectConfig;

  constructor(
    contextManager: ContextManager,
    workflowEngine: WorkflowEngine,
    projectPath: string,
    projectConfig: ProjectConfig,
    apiKey?: string
  ) {
    // Initialize Anthropic client
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.anthropic = new Anthropic({
      apiKey: key
    });

    this.contextManager = contextManager;
    this.workflowEngine = workflowEngine;
    this.projectPath = projectPath;
    this.projectConfig = projectConfig;
  }

  /**
   * Execute a single workflow step
   */
  public async executeStep(
    workflow: WorkflowPattern,
    step: WorkflowStep,
    options: ExecutionOptions = {}
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🤖 Executing: ${step.action}`);
    console.log(`   Agent ID: ${step.agentId}`);
    console.log(`   Step ID: ${step.id}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      // Mark step as in-progress
      step.status = 'in-progress';

      // Load agent prompt from markdown file
      const agentPrompt = this.loadAgentPrompt(step.agentId);
      if (!agentPrompt) {
        throw new Error(`Agent prompt file not found for agent: ${step.agentId}`);
      }

      console.log(`📄 Loaded agent prompt (${agentPrompt.length} chars)`);

      // Build agent context
      const context = this.contextManager.buildAgentContext(
        step.agentId,
        this.projectConfig,
        step.inputs // Use step inputs as required tags
      );

      console.log(`📦 Built agent context:`);
      console.log(`   - Available knowledge: ${Object.keys(context.availableKnowledge).length} items`);
      console.log(`   - Previous outputs: ${Object.keys(context.previousOutputs).length} items`);

      // Prepare the full prompt with context
      const fullPrompt = this.buildFullPrompt(agentPrompt, context);

      console.log(`\n🚀 Calling Claude API...`);
      console.log(`   Model: ${options.model || 'claude-sonnet-4-20250514'}`);
      console.log(`   Max tokens: ${options.maxTokens || 4096}`);
      console.log(`   Temperature: ${options.temperature || 1.0}`);

      // Call Claude API
      const response = await this.callClaudeAPI(fullPrompt, options);

      console.log(`\n✅ Response received`);
      console.log(`   Output length: ${response.output.length} chars`);
      console.log(`   Tokens used: ${response.tokensUsed.input} input, ${response.tokensUsed.output} output`);

      // Store the output as an artifact
      const artifact = this.contextManager.storeArtifact(
        'output',
        `${step.agentId}-output`,
        response.output,
        step.agentId,
        ['agent-output', step.agentId, ...step.outputs],
        {
          stepId: step.id,
          action: step.action,
          tokensUsed: response.tokensUsed,
          timestamp: new Date().toISOString()
        }
      );

      console.log(`\n💾 Stored artifact: ${artifact.id}`);

      // Mark step as completed
      this.workflowEngine.completeStep(workflow, step.id);

      console.log(`\n✔️  Step completed successfully`);

      const executionTime = Date.now() - startTime;

      console.log(`   Execution time: ${(executionTime / 1000).toFixed(2)}s`);
      console.log(`${'='.repeat(80)}\n`);

      return {
        stepId: step.id,
        agentId: step.agentId,
        success: true,
        output: response.output,
        tokensUsed: response.tokensUsed,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`\n❌ Execution failed: ${errorMessage}`);
      console.log(`   Execution time: ${(executionTime / 1000).toFixed(2)}s`);
      console.log(`${'='.repeat(80)}\n`);

      // Mark step as failed
      step.status = 'failed';

      return {
        stepId: step.id,
        agentId: step.agentId,
        success: false,
        error: errorMessage,
        executionTime
      };
    }
  }

  /**
   * Execute multiple workflow steps sequentially
   */
  public async executeSteps(
    workflow: WorkflowPattern,
    steps: WorkflowStep[],
    options: ExecutionOptions = {}
  ): Promise<AgentExecutionResult[]> {
    const results: AgentExecutionResult[] = [];

    console.log(`\n${'#'.repeat(80)}`);
    console.log(`🎯 Starting workflow execution`);
    console.log(`   Total steps: ${steps.length}`);
    console.log(`${'#'.repeat(80)}\n`);

    for (const step of steps) {
      const result = await this.executeStep(workflow, step, options);
      results.push(result);

      // Stop on first failure if not continuing
      if (!result.success && !options.streaming) {
        console.log(`\n⚠️  Stopping workflow due to step failure\n`);
        break;
      }
    }

    // Display summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    const totalTokens = results.reduce((sum, r) => {
      return sum + (r.tokensUsed?.input || 0) + (r.tokensUsed?.output || 0);
    }, 0);

    console.log(`\n${'#'.repeat(80)}`);
    console.log(`📊 Workflow Execution Summary`);
    console.log(`   Successful: ${successful}/${steps.length}`);
    console.log(`   Failed: ${failed}/${steps.length}`);
    console.log(`   Total time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   Total tokens: ${totalTokens}`);
    console.log(`${'#'.repeat(80)}\n`);

    return results;
  }

  /**
   * Execute entire workflow
   */
  public async executeWorkflow(
    workflow: WorkflowPattern,
    options: ExecutionOptions = {}
  ): Promise<AgentExecutionResult[]> {
    const allResults: AgentExecutionResult[] = [];

    console.log(`\n${'█'.repeat(80)}`);
    console.log(`🎬 Starting complete workflow execution`);
    console.log(`   Workflow type: ${workflow.type}`);
    console.log(`   Total steps: ${workflow.steps.length}`);
    console.log(`${'█'.repeat(80)}\n`);

    while (true) {
      // Get next executable steps
      const nextSteps = this.workflowEngine.getNextSteps(workflow);

      if (nextSteps.length === 0) {
        // Check if workflow is complete
        const progress = this.workflowEngine.getProgress(workflow);
        if (progress.completed === workflow.steps.length) {
          console.log(`\n🎉 Workflow completed successfully!\n`);
          break;
        } else if (progress.pending === 0 && progress.inProgress === 0) {
          console.log(`\n⚠️  Workflow stuck - no more executable steps\n`);
          break;
        }
      }

      // Execute next steps
      console.log(`\n📋 Executing ${nextSteps.length} steps...\n`);
      const results = await this.executeSteps(workflow, nextSteps, options);
      allResults.push(...results);

      // Stop if any step failed
      if (results.some(r => !r.success)) {
        console.log(`\n❌ Workflow failed\n`);
        break;
      }
    }

    return allResults;
  }

  /**
   * Load agent prompt from markdown file
   */
  private loadAgentPrompt(agentId: string): string | null {
    const agentsDir = join(this.projectPath, 'agents');

    // Find the agent markdown file
    const files = require('fs').readdirSync(agentsDir);
    const agentFile = files.find((f: string) => f.startsWith(agentId) && f.endsWith('.md'));

    if (!agentFile) {
      return null;
    }

    const filepath = join(agentsDir, agentFile);

    if (!existsSync(filepath)) {
      return null;
    }

    return readFileSync(filepath, 'utf-8');
  }

  /**
   * Build full prompt with context
   */
  private buildFullPrompt(agentPrompt: string, context: any): string {
    const sections: string[] = [];

    // Add the agent's base prompt
    sections.push(agentPrompt);
    sections.push('\n---\n');

    // Add project context
    sections.push('## Current Project Context\n');
    sections.push(`**Project Name:** ${context.projectContext.projectName}`);
    sections.push(`**Project Type:** ${context.projectContext.projectType}`);
    sections.push(`**Domains:** ${context.projectContext.domains.join(', ')}`);
    sections.push('');

    // Add constraints
    if (Object.keys(context.constraints).length > 0) {
      sections.push('### Constraints:');
      for (const [key, value] of Object.entries(context.constraints)) {
        sections.push(`- **${key}:** ${value}`);
      }
      sections.push('');
    }

    // Add available knowledge
    if (Object.keys(context.availableKnowledge).length > 0) {
      sections.push('### Available Knowledge:');
      for (const [key, value] of Object.entries(context.availableKnowledge)) {
        sections.push(`\n**${key}:**`);
        sections.push('```');
        sections.push(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
        sections.push('```');
      }
      sections.push('');
    }

    // Add previous agent outputs
    if (Object.keys(context.previousOutputs).length > 0) {
      sections.push('### Previous Agent Outputs:');
      for (const [agentId, output] of Object.entries(context.previousOutputs)) {
        sections.push(`\n**From ${agentId}:**`);
        sections.push('```');
        sections.push(typeof output === 'string' ? output : JSON.stringify(output, null, 2));
        sections.push('```');
      }
      sections.push('');
    }

    // Add task instruction
    sections.push('\n---\n');
    sections.push('## Your Task\n');
    sections.push('Based on the above context and your expertise, please:');
    sections.push('1. Analyze the current project requirements');
    sections.push('2. Apply your domain knowledge and thinking patterns');
    sections.push('3. Produce the outputs specified in your role description');
    sections.push('4. Be specific, actionable, and thorough');
    sections.push('5. Consider the project constraints and context');
    sections.push('6. Document your reasoning and assumptions');
    sections.push('\nProvide your complete response below:');
    sections.push('');

    return sections.join('\n');
  }

  /**
   * Call Claude API
   */
  private async callClaudeAPI(
    prompt: string,
    options: ExecutionOptions = {}
  ): Promise<{ output: string; tokensUsed: { input: number; output: number } }> {
    const model = options.model || 'claude-sonnet-4-20250514';
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature || 1.0;

    try {
      const message = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Extract text from response
      const output = message.content
        .filter(block => block.type === 'text')
        .map(block => ('text' in block ? block.text : ''))
        .join('\n');

      return {
        output,
        tokensUsed: {
          input: message.usage.input_tokens,
          output: message.usage.output_tokens
        }
      };

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Claude API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get execution statistics
   */
  public getExecutionStats(results: AgentExecutionResult[]): {
    totalSteps: number;
    successful: number;
    failed: number;
    totalTime: number;
    totalTokens: number;
    averageTimePerStep: number;
    averageTokensPerStep: number;
  } {
    const totalSteps = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    const totalTokens = results.reduce((sum, r) => {
      return sum + (r.tokensUsed?.input || 0) + (r.tokensUsed?.output || 0);
    }, 0);

    return {
      totalSteps,
      successful,
      failed,
      totalTime,
      totalTokens,
      averageTimePerStep: totalSteps > 0 ? totalTime / totalSteps : 0,
      averageTokensPerStep: totalSteps > 0 ? totalTokens / totalSteps : 0
    };
  }
}
