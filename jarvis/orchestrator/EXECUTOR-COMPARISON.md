# Agent Executor Comparison

This document compares the two agent executors available in the Adaptive Agent System.

## Overview

| Feature | AgentExecutor (API) | ClaudeCodeAgentExecutor |
|---------|-------------------|------------------------|
| **API Key Required** | ✅ Yes | ❌ No |
| **Cost** | 💰 Pay per token | 🆓 Free |
| **Use Case** | Production | Development/Testing |
| **Execution** | External API calls | Claude Code Task tool |
| **Speed** | Fast (parallel possible) | Sequential |
| **Token Tracking** | ✅ Yes | ❌ No |
| **Production Ready** | ✅ Yes | ❌ No |
| **Local Development** | ⚠️ Requires setup | ✅ Perfect |

---

## AgentExecutor (API Mode)

### Overview
Uses the Anthropic API to execute agents. Sends prompts to Claude via HTTP requests.

### When to Use
- ✅ Production deployments
- ✅ When you need token usage tracking
- ✅ When you need precise control over model parameters
- ✅ When you have an API key and budget
- ✅ When you need parallel agent execution (future feature)

### Requirements
```bash
# Required environment variable
export ANTHROPIC_API_KEY=your-key-here
```

### Example Usage
```typescript
import { AgentExecutor } from './orchestrator/agent-executor';

const executor = new AgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig,
  apiKey  // Optional, reads from env if not provided
);

const result = await executor.executeStep(workflow, step, {
  maxTokens: 4096,
  temperature: 1.0,
  model: 'claude-sonnet-4-5'
});
```

### Pros
- **Production-ready**: Battle-tested, reliable
- **Token tracking**: Know exactly how many tokens you use
- **Model control**: Choose specific Claude models
- **Scalable**: Can handle large workflows
- **Statistics**: Detailed execution metrics

### Cons
- **Costs money**: Pay per token used
- **API key required**: Setup overhead
- **External dependency**: Requires internet connection
- **Rate limits**: Subject to API rate limits

---

## ClaudeCodeAgentExecutor (Task Mode)

### Overview
Uses Claude Code's built-in Task tool to spawn agents within the current session. No external API calls.

### When to Use
- ✅ Development and testing
- ✅ Learning the system
- ✅ Prototyping workflows
- ✅ When you don't have an API key
- ✅ When you want to avoid costs
- ✅ Quick experimentation

### Requirements
```bash
# No requirements! Just run it
npm run execute-claude-code
```

### Example Usage
```typescript
import { ClaudeCodeAgentExecutor } from './orchestrator/claude-code-agent-executor';
import { AgentLogger } from './orchestrator/agent-logger';

const logger = new AgentLogger();

const executor = new ClaudeCodeAgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig,
  logger  // Optional but recommended
);

const result = await executor.executeStep(workflow, step, {
  model: 'sonnet'  // Uses Claude Code's models
});
```

### Pros
- **Free**: No API costs
- **No setup**: Works immediately
- **Perfect for dev**: Ideal for development
- **Integrated logging**: Works beautifully with AgentLogger
- **File access**: Can use Read, Write, Edit tools
- **No rate limits**: Uses your Claude Code session

### Cons
- **Development only**: Not for production
- **Sequential**: Agents run one at a time
- **No token tracking**: Can't measure token usage
- **Claude Code only**: Must run in Claude Code environment
- **Session limits**: Limited by your Claude Code usage

---

## Switching Between Executors

### Method 1: Use the Unified Example

Edit `examples/run-agent-executor.ts`:

```typescript
// Change this line to switch modes
const EXECUTION_MODE: 'api' | 'claude-code' = 'claude-code';
```

Then run:
```bash
npm run execute-agents
```

### Method 2: Use Dedicated Examples

For Claude Code mode:
```bash
npm run execute-claude-code
```

For API mode:
```bash
export ANTHROPIC_API_KEY=your-key
npm run execute-agents
# Change EXECUTION_MODE to 'api' in the file first
```

---

## Recommendations

### For Development
```
✅ Use ClaudeCodeAgentExecutor
- Free
- Fast to test
- No setup hassle
- Perfect for iteration
```

### For Testing
```
⚠️ Use Both
- Test with ClaudeCodeAgentExecutor first
- Validate with AgentExecutor before production
- Ensure prompts work with both
```

### For Production
```
✅ Use AgentExecutor
- Reliable
- Token tracking
- Scalable
- Professional
```

---

## Architecture Comparison

### AgentExecutor Flow
```
Workflow Step
    ↓
Load Agent Prompt
    ↓
Build Context
    ↓
HTTP Request → Anthropic API
    ↓
Parse Response
    ↓
Store Artifact
    ↓
Update Workflow
```

### ClaudeCodeAgentExecutor Flow
```
Workflow Step
    ↓
Load Agent Prompt
    ↓
Build Context
    ↓
Task Tool → Claude Code Session
    ↓
Agent Executes in Subprocess
    ↓
Collect Results
    ↓
Store Artifact
    ↓
Update Workflow
```

---

## Code Examples

### Example 1: Simple Step Execution

**With API:**
```typescript
const executor = new AgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig
);

const result = await executor.executeStep(workflow, step);
console.log(`Used ${result.tokensUsed?.input + result.tokensUsed?.output} tokens`);
```

**With Claude Code:**
```typescript
const logger = new AgentLogger();
const executor = new ClaudeCodeAgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig,
  logger
);

const result = await executor.executeStep(workflow, step);
// No token tracking, but beautiful logging!
```

### Example 2: Entire Workflow

**Both executors support the same interface:**
```typescript
const results = await executor.executeWorkflow(workflow, {
  maxTokens: 4096,
  temperature: 1.0
});

const stats = executor.getExecutionStats(results);
console.log(`Completed ${stats.successful}/${stats.totalSteps} steps`);
```

---

## Migration Path

### Development → Production

1. **Start with Claude Code** during development:
   ```typescript
   const executor = new ClaudeCodeAgentExecutor(...);
   ```

2. **Test with API** before deploying:
   ```typescript
   const executor = new AgentExecutor(...);
   ```

3. **Deploy with API** in production:
   ```typescript
   const apiKey = process.env.ANTHROPIC_API_KEY;
   const executor = new AgentExecutor(..., apiKey);
   ```

### Factory Pattern (Recommended)

Create a factory function:
```typescript
function createExecutor(mode: 'dev' | 'prod') {
  if (mode === 'dev') {
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
const executor = createExecutor(
  process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
);
```

---

## Performance Comparison

### Single Step Execution

| Metric | API | Claude Code |
|--------|-----|-------------|
| Setup time | ~100ms | ~50ms |
| API call | ~2-5s | ~3-6s |
| Response parsing | ~10ms | ~50ms |
| Total | ~2-5s | ~3-6s |

*Times are approximate and vary by prompt complexity*

### Multiple Steps (3 steps)

| Metric | API | Claude Code |
|--------|-----|-------------|
| Sequential | ~6-15s | ~9-18s |
| Parallel | ~2-5s | N/A |

*API executor can potentially run steps in parallel (future feature)*

---

## Cost Comparison

### Example Workflow (10 steps, ~1000 tokens per step)

**API Mode:**
- Input tokens: ~8,000
- Output tokens: ~12,000
- Cost: ~$0.60 (Claude Sonnet 4.5 pricing)

**Claude Code Mode:**
- Cost: $0 (uses your Claude Code subscription)
- Counts toward your usage limits

---

## Best Practices

### ✅ Do

- Use Claude Code for development
- Test prompts with Claude Code first
- Switch to API for production
- Log everything (both support AgentLogger)
- Handle errors gracefully
- Monitor execution stats

### ❌ Don't

- Use Claude Code in production
- Rely on token counts from Claude Code
- Mix executors in same workflow
- Skip testing with API before deployment
- Forget to set API key in production
- Ignore error messages

---

## Troubleshooting

### API Executor Issues

**Problem: "ANTHROPIC_API_KEY environment variable is required"**
```bash
export ANTHROPIC_API_KEY=your-key-here
```

**Problem: "Rate limit exceeded"**
- Wait a few seconds
- Use exponential backoff
- Consider upgrading API tier

**Problem: "Invalid API key"**
- Check key is correct
- Ensure no extra spaces
- Verify key hasn't expired

### Claude Code Executor Issues

**Problem: "Task tool not available"**
- Ensure running in Claude Code
- Check Claude Code version
- Verify session is active

**Problem: "Agent timeout"**
- Simplify agent prompts
- Reduce context size
- Break into smaller steps

---

## FAQ

**Q: Can I use both executors in the same project?**
A: Yes! Switch between them using the EXECUTION_MODE setting or use different examples.

**Q: Will my workflows work with both executors?**
A: Yes! Both implement the same interface and support the same workflow format.

**Q: Which is faster?**
A: Similar performance for single steps. API can be faster with parallel execution (future feature).

**Q: Can I track costs with Claude Code mode?**
A: No, Claude Code mode doesn't provide token tracking.

**Q: Is Claude Code mode secure?**
A: Yes, runs in your local Claude Code session with your permissions.

---

## Summary

| Scenario | Recommended Executor |
|----------|---------------------|
| Learning the system | ClaudeCodeAgentExecutor |
| Quick prototyping | ClaudeCodeAgentExecutor |
| Development | ClaudeCodeAgentExecutor |
| Pre-deployment testing | AgentExecutor |
| Production deployment | AgentExecutor |
| Cost-sensitive projects | ClaudeCodeAgentExecutor (dev) |
| Enterprise applications | AgentExecutor |
| Demo/POC | ClaudeCodeAgentExecutor |

**Bottom line:** Start with ClaudeCodeAgentExecutor for development, switch to AgentExecutor for production. Both work seamlessly with the same workflow definitions!
