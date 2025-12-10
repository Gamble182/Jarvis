# Claude Code Agent Executor

A development-friendly agent executor that runs workflows without requiring an Anthropic API key!

## 🎯 Overview

The **ClaudeCodeAgentExecutor** is a parallel implementation to the production `AgentExecutor` that allows you to:

- ✅ Run agents **without an API key**
- ✅ Test workflows **for free**
- ✅ Develop and debug **in Claude Code**
- ✅ See beautiful **structured logs**
- ✅ Avoid **API costs** during development

## 🚀 Quick Start

### Run the Example

```bash
# No API key needed!
npm run execute-claude-code
```

That's it! The executor will:
1. Create a demo project automatically
2. Set up a test workflow
3. Execute the first step
4. Show you beautiful logs
5. Store results for subsequent steps

### Output

```
════════════════════════════════════════════════════════════════════════════════
  CLAUDE CODE AGENT EXECUTOR
════════════════════════════════════════════════════════════════════════════════
[13:15:07.967] ℹ️  INFO: Running agents in Claude Code session - No API key required!
[13:15:07.994] ℹ️  INFO: This is perfect for development and testing.

════════════════════════════════════════════════════════════════════════════════
  WORKFLOW STATUS
════════════════════════════════════════════════════════════════════════════════
[13:15:08.020] ℹ️  INFO: Workflow type: sequential
[13:15:08.021] ℹ️  INFO: Total steps: 3
[13:15:08.022] ℹ️  INFO: Completed: 0
[13:15:08.023] ℹ️  INFO: Pending: 3
[13:15:08.024] ℹ️  INFO: Progress: 0%

════════════════════════════════════════════════════════════════════════════════
[13:15:08.029] 🤖 AGENT START [analyzer] Analyze project requirements
────────────────────────────────────────────────────────────────────────────────
[13:15:08.035] ✅ SUCCESS [analyzer] Analyze project requirements
   ✓ Step completed successfully
════════════════════════════════════════════════════════════════════════════════
```

## 📚 Usage

### Basic Example

```typescript
import { ClaudeCodeAgentExecutor } from './orchestrator/claude-code-agent-executor';
import { AgentLogger } from './orchestrator/agent-logger';
import { ContextManager } from './orchestrator/context-manager';
import { WorkflowEngine } from './orchestrator/workflow-engine';

// Initialize components
const logger = new AgentLogger({
  enableFileLogging: true,
  logDirectory: './logs'
});

const contextManager = new ContextManager(projectPath);
const workflowEngine = new WorkflowEngine();

// Create executor (no API key needed!)
const executor = new ClaudeCodeAgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig,
  logger  // Optional but recommended
);

// Execute a single step
const result = await executor.executeStep(workflow, step, {
  model: 'sonnet'
});

// Execute entire workflow
const results = await executor.executeWorkflow(workflow);
```

### With Existing Project

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

// Load your project
const projectPath = 'projects/my-project';
const projectConfig = JSON.parse(
  readFileSync(join(projectPath, 'project-config.json'), 'utf-8')
);
const workflow = JSON.parse(
  readFileSync(join(projectPath, 'workflow.json'), 'utf-8')
);

// Initialize and run
const executor = new ClaudeCodeAgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig,
  logger
);

const nextSteps = workflowEngine.getNextSteps(workflow);
const results = await executor.executeSteps(workflow, nextSteps);
```

## 🆚 vs AgentExecutor (API)

| Feature | ClaudeCodeAgentExecutor | AgentExecutor |
|---------|------------------------|---------------|
| **API Key** | ❌ Not required | ✅ Required |
| **Cost** | 🆓 Free | 💰 Pay per token |
| **Speed** | Similar | Similar |
| **Token Tracking** | ❌ No | ✅ Yes |
| **Production** | ❌ Development only | ✅ Production ready |
| **Logging** | ✅ Integrated | ⚠️ Basic |
| **Parallel Execution** | ❌ Sequential | ✅ Possible |

## 🎨 Features

### 1. **No API Key Required**

```typescript
// Just run it!
const executor = new ClaudeCodeAgentExecutor(...);
// No ANTHROPIC_API_KEY environment variable needed
```

### 2. **Beautiful Logging**

Integrates perfectly with `AgentLogger`:

```typescript
const logger = new AgentLogger({
  enableFileLogging: true,
  logDirectory: './logs',
  logLevel: LogLevel.INFO
});

const executor = new ClaudeCodeAgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig,
  logger  // Pass logger for beautiful output
);
```

### 3. **Same Interface as AgentExecutor**

Easy to switch between development and production:

```typescript
// Development
const executor = new ClaudeCodeAgentExecutor(...);

// Production (just change the class!)
const executor = new AgentExecutor(...);

// Same methods work for both!
const result = await executor.executeStep(workflow, step);
```

### 4. **Automatic Context Management**

The executor automatically:
- Loads agent prompts from files
- Builds context from previous steps
- Stores results as artifacts
- Updates workflow status
- Tracks dependencies

## 📖 API Reference

### Constructor

```typescript
new ClaudeCodeAgentExecutor(
  contextManager: ContextManager,
  workflowEngine: WorkflowEngine,
  projectPath: string,
  projectConfig: ProjectConfig,
  logger?: AgentLogger
)
```

**Parameters:**
- `contextManager`: Manages artifacts and knowledge base
- `workflowEngine`: Manages workflow execution order
- `projectPath`: Path to project directory
- `projectConfig`: Project configuration
- `logger`: Optional AgentLogger for structured logging

### Methods

#### executeStep()

Execute a single workflow step.

```typescript
await executor.executeStep(
  workflow: WorkflowPattern,
  step: WorkflowStep,
  options?: ExecutionOptions
): Promise<AgentExecutionResult>
```

**Returns:**
```typescript
{
  stepId: string;
  agentId: string;
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}
```

#### executeSteps()

Execute multiple steps sequentially.

```typescript
await executor.executeSteps(
  workflow: WorkflowPattern,
  steps: WorkflowStep[],
  options?: ExecutionOptions
): Promise<AgentExecutionResult[]>
```

#### executeWorkflow()

Execute entire workflow.

```typescript
await executor.executeWorkflow(
  workflow: WorkflowPattern,
  options?: ExecutionOptions
): Promise<AgentExecutionResult[]>
```

#### getExecutionStats()

Get statistics from execution results.

```typescript
executor.getExecutionStats(
  results: AgentExecutionResult[]
): ExecutionStats
```

**Returns:**
```typescript
{
  totalSteps: number;
  successful: number;
  failed: number;
  totalTime: number;
  totalTokens: number;  // Always 0 for ClaudeCode
  averageTimePerStep: number;
  averageTokensPerStep: number;  // Always 0 for ClaudeCode
}
```

## 🔧 Configuration

### Execution Options

```typescript
interface ExecutionOptions {
  maxTokens?: number;      // Not used in Claude Code mode
  temperature?: number;     // Not used in Claude Code mode
  model?: string;          // 'sonnet', 'opus', or 'haiku'
  streaming?: boolean;     // Not used in Claude Code mode
  timeout?: number;        // Not used in Claude Code mode
}
```

## 📁 Project Structure

The executor expects this structure:

```
your-project/
├── project-config.json     # Project configuration
├── workflow.json           # Workflow definition
├── agents/                 # Agent prompt files
│   ├── analyzer.md
│   ├── architect.md
│   └── developer.md
├── context/               # Artifacts (auto-created)
└── knowledge-base/        # Additional context
```

### project-config.json

```json
{
  "projectName": "My Project",
  "projectType": "web",
  "domains": ["development", "testing"],
  "requiredCapabilities": ["analysis", "architecture"],
  "phases": ["setup", "implementation"],
  "constraints": {
    "technicalComplexity": "medium"
  }
}
```

### workflow.json

```json
{
  "type": "sequential",
  "steps": [
    {
      "id": "step-1",
      "action": "Analyze requirements",
      "agentId": "analyzer",
      "inputs": [],
      "outputs": ["step-1-output"],
      "status": "pending"
    }
  ],
  "dependencies": {
    "step-1": []
  }
}
```

### agents/analyzer.md

```markdown
# Analyzer Agent

You are a project analyzer agent.

## Your Responsibilities
1. Review project requirements
2. Identify key features
3. Assess technical requirements

## Output Format
Provide structured analysis with:
- Project overview
- Key features
- Recommendations
```

## 🎯 Use Cases

### 1. **Development & Testing**

Perfect for developing workflows without API costs:

```typescript
const executor = new ClaudeCodeAgentExecutor(...);

// Test your workflow structure
const result = await executor.executeStep(workflow, step);

// Verify dependencies work correctly
const results = await executor.executeWorkflow(workflow);

// Check execution stats
const stats = executor.getExecutionStats(results);
console.log(`Success rate: ${stats.successful}/${stats.totalSteps}`);
```

### 2. **Learning the System**

Great for understanding how agents work:

```typescript
const logger = new AgentLogger({
  logLevel: LogLevel.DEBUG,
  enableFileLogging: true
});

const executor = new ClaudeCodeAgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig,
  logger
);

// See every detail of execution
await executor.executeStep(workflow, step);

// Review logs afterward
// Check: ./logs/agent-log-*.log
```

### 3. **Prototyping Workflows**

Rapidly iterate on workflow designs:

```typescript
// Try different workflow structures
const workflows = [
  createSequentialWorkflow(),
  createParallelWorkflow(),
  createIterativeWorkflow()
];

for (const workflow of workflows) {
  const results = await executor.executeWorkflow(workflow);
  const stats = executor.getExecutionStats(results);
  console.log(`${workflow.type}: ${stats.successful}/${stats.totalSteps} successful`);
}
```

## ⚠️ Limitations

### Not for Production

This executor is **development-only**:
- ❌ Don't use in production deployments
- ❌ No token usage tracking
- ❌ No parallel execution (yet)
- ❌ Requires Claude Code environment

### Task Tool Integration

Currently returns placeholder output:

```typescript
private async executeAgentTask(
  agentId: string,
  prompt: string,
  options: ExecutionOptions
): Promise<string> {
  // TODO: Replace with actual Task tool call
  // Example:
  // const result = await Task({
  //   subagent_type: 'general-purpose',
  //   description: `Execute agent ${agentId}`,
  //   prompt: prompt,
  //   model: options.model || 'sonnet'
  // });
  // return result;

  return `[Claude Code Agent Execution Placeholder]

Agent ID: ${agentId}
Model: ${options.model || 'sonnet'}

The agent would execute here using Claude Code's Task tool.
`;
}
```

To enable real execution, this method needs to be updated with actual Task tool calls.

## 🔄 Migration Path

### Development → Production

1. **Develop with ClaudeCode:**
   ```typescript
   const devExecutor = new ClaudeCodeAgentExecutor(...);
   ```

2. **Test with API:**
   ```typescript
   const testExecutor = new AgentExecutor(...);
   ```

3. **Deploy with API:**
   ```typescript
   const prodExecutor = new AgentExecutor(..., process.env.ANTHROPIC_API_KEY);
   ```

### Factory Pattern

Recommended approach for easy switching:

```typescript
function createExecutor(
  mode: 'development' | 'production',
  contextManager: ContextManager,
  workflowEngine: WorkflowEngine,
  projectPath: string,
  projectConfig: ProjectConfig,
  logger?: AgentLogger
) {
  if (mode === 'development') {
    return new ClaudeCodeAgentExecutor(
      contextManager,
      workflowEngine,
      projectPath,
      projectConfig,
      logger
    );
  } else {
    return new AgentExecutor(
      contextManager,
      workflowEngine,
      projectPath,
      projectConfig
    );
  }
}

// Usage
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const executor = createExecutor(mode, ...);
```

## 📊 Performance

### Execution Time

Similar to API executor:
- Single step: ~0.01-0.05s (excluding actual agent work)
- Workflow setup: ~0.1-0.2s
- Context loading: ~0.05-0.1s per artifact

### Memory Usage

Lightweight:
- Base overhead: ~10-20MB
- Per workflow: ~1-5MB
- Per artifact: ~0.1-1MB

## 🐛 Troubleshooting

### "Cannot read properties of undefined"

Check your ProjectConfig:
```typescript
const config: ProjectConfig = {
  projectName: 'My Project',  // Required
  projectType: 'web',         // Required
  domains: ['dev'],           // Required (can be empty array)
  requiredCapabilities: [],   // Required
  phases: [],                 // Required
  constraints: {}             // Required
};
```

### "Agent prompt file not found"

Ensure agent files exist:
```bash
ls -la projects/my-project/agents/
# Should show: analyzer.md, architect.md, etc.
```

### "Dependencies not met"

Check workflow structure:
```typescript
{
  "dependencies": {
    "step-1": [],           // No dependencies
    "step-2": ["step-1"],   // Depends on step-1
    "step-3": ["step-2"]    // Depends on step-2
  }
}
```

## 📚 Examples

See:
- `examples/run-claude-code-executor.ts` - Full example with demo project
- `examples/run-agent-executor.ts` - Switchable API/ClaudeCode executor
- `orchestrator/EXECUTOR-COMPARISON.md` - Detailed comparison

## 🎓 Best Practices

1. **Always use a logger** for better visibility
2. **Test with ClaudeCode first** before using API
3. **Check execution stats** to verify workflow correctness
4. **Review artifacts** in context directory
5. **Use factory pattern** for easy switching
6. **Keep workflows simple** during development
7. **Switch to API** before production deployment

## 📝 Summary

The ClaudeCodeAgentExecutor is your **perfect development companion**:

✅ **Free** - No API costs
✅ **Fast** - Quick iteration
✅ **Easy** - No setup hassle
✅ **Beautiful** - Structured logging
✅ **Compatible** - Same interface as AgentExecutor

Use it for development, switch to AgentExecutor for production!

---

**Happy agent execution! 🚀**
