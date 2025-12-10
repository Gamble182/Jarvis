import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ContextManager } from './context-manager.js';
import { WorkflowPattern, WorkflowStep, ProjectConfig } from '../shared/types.js';
import { WorkflowEngine } from './workflow-engine.js';
import { AgentLogger } from './agent-logger.js';

/**
 * Agent execution result (same interface as AgentExecutor for compatibility)
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
 * Execution statistics
 */
export interface ExecutionStats {
  totalSteps: number;
  successful: number;
  failed: number;
  totalTime: number;
  totalTokens: number;
  averageTimePerStep: number;
  averageTokensPerStep: number;
}

/**
 * ClaudeCodeAgentExecutor - Executes agents using Claude Code's Task tool
 *
 * This executor runs agents within the current Claude Code session without
 * requiring an API key. Perfect for development and testing!
 *
 * Key differences from AgentExecutor:
 * - Uses Task tool instead of Anthropic API
 * - No API key required
 * - Runs in current Claude Code session
 * - Free (no API costs)
 * - Sequential execution (agents run one by one)
 *
 * Usage:
 * ```typescript
 * const executor = new ClaudeCodeAgentExecutor(
 *   contextManager,
 *   workflowEngine,
 *   projectPath,
 *   projectConfig,
 *   logger
 * );
 *
 * const result = await executor.executeStep(workflow, step);
 * ```
 */
export class ClaudeCodeAgentExecutor {
  private contextManager: ContextManager;
  private workflowEngine: WorkflowEngine;
  private projectPath: string;
  private projectConfig: ProjectConfig;
  private logger?: AgentLogger;

  constructor(
    contextManager: ContextManager,
    workflowEngine: WorkflowEngine,
    projectPath: string,
    projectConfig: ProjectConfig,
    logger?: AgentLogger
  ) {
    this.contextManager = contextManager;
    this.workflowEngine = workflowEngine;
    this.projectPath = projectPath;
    this.projectConfig = projectConfig;
    this.logger = logger;
  }

  /**
   * Load agent prompt from markdown file
   */
  private loadAgentPrompt(agentId: string): string | null {
    const agentPath = join(this.projectPath, 'agents', `${agentId}.md`);
    if (!existsSync(agentPath)) {
      return null;
    }
    return readFileSync(agentPath, 'utf-8');
  }

  /**
   * Build context for agent execution
   */
  private buildAgentContext(step: WorkflowStep): string {
    // Get artifacts for required inputs
    const relevantArtifacts = step.inputs.flatMap(inputId => {
      const artifact = this.contextManager.getArtifact(inputId);
      return artifact ? [artifact] : [];
    });

    let contextStr = '# Available Context\n\n';

    if (relevantArtifacts.length === 0) {
      contextStr += 'No previous context available.\n';
    } else {
      relevantArtifacts.forEach((artifact) => {
        contextStr += `## ${artifact.type}: ${artifact.name}\n`;
        contextStr += `Agent: ${artifact.createdBy}\n`;
        contextStr += `Created: ${artifact.createdAt}\n`;
        contextStr += `\`\`\`\n${typeof artifact.content === 'string' ? artifact.content : JSON.stringify(artifact.content, null, 2)}\n\`\`\`\n\n`;
      });
    }

    return contextStr;
  }

  /**
   * Build prompt for Claude Code agent
   */
  private buildAgentPrompt(step: WorkflowStep, agentPrompt: string): string {
    const context = this.buildAgentContext(step);

    return `
# Agent Task: ${step.action}

You are an AI agent executing a workflow step for the "${this.projectConfig.projectName}" project.

## Project Information
- **Name**: ${this.projectConfig.projectName}
- **Type**: ${this.projectConfig.projectType}
- **Domains**: ${this.projectConfig.domains?.join(', ') || 'None'}
- **Path**: ${this.projectPath}

## Current Step
- **Step ID**: ${step.id}
- **Agent ID**: ${step.agentId}
- **Action**: ${step.action}
- **Inputs**: ${step.inputs.join(', ') || 'None'}
- **Expected Outputs**: ${step.outputs.join(', ')}

## Agent Instructions
${agentPrompt}

${context}

## Your Task
Execute the step described above. Your output will be stored as an artifact for use by subsequent agents.

**IMPORTANT Guidelines:**
1. Focus on the specific task described in the action
2. Use the provided context from previous steps
3. Be thorough but concise in your output
4. If you create or modify files, describe what you did
5. If you encounter errors, explain them clearly
6. Structure your output so it can be used by other agents

**Output Format:**
Provide your results in a clear, structured format. Start with a brief summary, then provide details.

Begin your work now!
`;
  }

  /**
   * Execute a single workflow step using Claude Code Task tool
   */
  public async executeStep(
    workflow: WorkflowPattern,
    step: WorkflowStep,
    options: ExecutionOptions = {}
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    const agentInfo = {
      id: step.agentId,
      name: step.action,
      type: 'workflow-agent'
    };

    if (this.logger) {
      this.logger.agentStart(agentInfo, `Executing step: ${step.id}`);
    }

    try {
      // Mark step as in-progress
      step.status = 'in-progress';

      // Load agent prompt
      const agentPrompt = this.loadAgentPrompt(step.agentId);
      if (!agentPrompt) {
        throw new Error(`Agent prompt file not found for agent: ${step.agentId}`);
      }

      if (this.logger) {
        this.logger.agentAction(agentInfo, 'Loading agent prompt', {
          agentId: step.agentId,
          promptPath: `agents/${step.agentId}.md`
        });
      }

      // Build full prompt for Claude Code agent
      const fullPrompt = this.buildAgentPrompt(step, agentPrompt);

      if (this.logger) {
        this.logger.agentThinking(agentInfo, 'Preparing to spawn agent task...');
        this.logger.agentAction(agentInfo, 'Spawning Claude Code agent', {
          model: options.model || 'sonnet',
          stepId: step.id
        });
      }

      // Note: In a real implementation, this would use the Task tool
      // For now, we'll simulate the execution by returning the prompt
      // The actual Task tool integration would be done by Claude Code itself

      const agentOutput = await this.executeAgentTask(
        step.agentId,
        fullPrompt,
        options
      );

      // Store result in context
      this.contextManager.storeArtifact(
        'step-output',
        `${step.id}-result`,
        agentOutput,
        step.agentId,
        ['workflow-output', step.id],
        { stepId: step.id, action: step.action }
      );

      // Mark step as complete
      step.status = 'completed';

      const executionTime = Date.now() - startTime;

      if (this.logger) {
        this.logger.agentOutput(agentInfo, {
          stepId: step.id,
          executionTime: `${(executionTime / 1000).toFixed(2)}s`,
          outputLength: agentOutput.length
        }, 'Execution Result');

        this.logger.agentSuccess(agentInfo, 'Step completed successfully', {
          duration: `${(executionTime / 1000).toFixed(2)}s`
        });
      }

      return {
        stepId: step.id,
        agentId: step.agentId,
        success: true,
        output: agentOutput,
        executionTime,
        // Note: Token usage not available in Claude Code mode
        tokensUsed: {
          input: 0,
          output: 0
        }
      };

    } catch (error) {
      step.status = 'failed';
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (this.logger) {
        this.logger.agentError(agentInfo, error as Error, {
          stepId: step.id,
          executionTime: `${(executionTime / 1000).toFixed(2)}s`
        });
      }

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
   * Execute agent task - This is where Claude Code Task tool would be called
   *
   * NOTE FOR CLAUDE CODE:
   * When this executor is used, replace this method's implementation with
   * an actual Task tool call. For now, it returns a placeholder.
   */
  private async executeAgentTask(
    agentId: string,
    prompt: string,
    options: ExecutionOptions
  ): Promise<string> {
    // TODO: Replace with actual Task tool call when running in Claude Code
    // Example:
    // const result = await Task({
    //   subagent_type: 'general-purpose',
    //   description: `Execute agent ${agentId}`,
    //   prompt: prompt,
    //   model: options.model || 'sonnet'
    // });
    // return result;

    // For now, return a simulated response
    return `[Claude Code Agent Execution Placeholder]

This is where the agent would execute using Claude Code's Task tool.

Agent ID: ${agentId}
Model: ${options.model || 'sonnet'}

In a real execution, this agent would:
1. Read and analyze the provided context
2. Execute the specified action
3. Return structured results

To enable real execution:
1. This executor must be run within Claude Code
2. The executeAgentTask method needs access to the Task tool
3. The Task tool will spawn a sub-agent that executes the prompt

The agent has received the following prompt:
---
${prompt.substring(0, 500)}...
---

For development purposes, this placeholder indicates successful setup.
`;
  }

  /**
   * Execute multiple workflow steps
   */
  public async executeSteps(
    workflow: WorkflowPattern,
    steps: WorkflowStep[],
    options: ExecutionOptions = {}
  ): Promise<AgentExecutionResult[]> {
    if (this.logger) {
      this.logger.section(`EXECUTING ${steps.length} STEPS`);
      this.logger.info(`Running ${steps.length} workflow steps sequentially...\n`);
    }

    const results: AgentExecutionResult[] = [];

    for (const step of steps) {
      const result = await this.executeStep(workflow, step, options);
      results.push(result);

      // Stop if step failed (unless we want to continue on error)
      if (!result.success) {
        if (this.logger) {
          this.logger.agentWarning(
            { id: step.agentId, name: step.action, type: 'workflow' },
            'Step failed, stopping execution',
            { stepId: step.id, error: result.error }
          );
        }
        break;
      }
    }

    return results;
  }

  /**
   * Execute entire workflow
   */
  public async executeWorkflow(
    workflow: WorkflowPattern,
    options: ExecutionOptions = {}
  ): Promise<AgentExecutionResult[]> {
    if (this.logger) {
      this.logger.section('EXECUTING COMPLETE WORKFLOW');
      this.logger.info(`Workflow type: ${workflow.type}`);
      this.logger.info(`Total steps: ${workflow.steps.length}\n`);
    }

    const results: AgentExecutionResult[] = [];
    let continueExecution = true;

    while (continueExecution) {
      const nextSteps = this.workflowEngine.getNextSteps(workflow);

      if (nextSteps.length === 0) {
        continueExecution = false;
        break;
      }

      const stepResults = await this.executeSteps(workflow, nextSteps, options);
      results.push(...stepResults);

      // Check if any step failed
      const hasFailed = stepResults.some(r => !r.success);
      if (hasFailed) {
        continueExecution = false;
      }
    }

    if (this.logger) {
      const stats = this.getExecutionStats(results);
      this.logger.section('WORKFLOW COMPLETE');
      this.logger.info(`Total steps executed: ${stats.totalSteps}`);
      this.logger.info(`Successful: ${stats.successful}`);
      this.logger.info(`Failed: ${stats.failed}`);
      this.logger.info(`Total time: ${(stats.totalTime / 1000).toFixed(2)}s\n`);
    }

    return results;
  }

  /**
   * Calculate execution statistics
   */
  public getExecutionStats(results: AgentExecutionResult[]): ExecutionStats {
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
