# AgentExecutor

Der AgentExecutor ist die Ausführungskomponente für das Adaptive Multi-Agent System. Er orchestriert die automatische Ausführung von Agents durch Claude API Aufrufe.

## Features

### 1. Agent-Ausführung
- **Einzelne Steps**: Führt einzelne Workflow-Steps aus
- **Mehrere Steps**: Führt mehrere Steps sequenziell aus
- **Kompletter Workflow**: Führt den gesamten Workflow automatisch aus

### 2. Claude API Integration
- Nutzt die offizielle Anthropic SDK (`@anthropic-ai/sdk`)
- Standard-Modell: `claude-sonnet-4-20250514`
- Konfigurierbare Parameter:
  - `maxTokens`: Maximale Anzahl Tokens (default: 4096)
  - `temperature`: Kreativität (default: 1.0)
  - `model`: Claude Modell (default: claude-sonnet-4-20250514)

### 3. Context Management
- Lädt Agent-Prompts aus Markdown-Dateien (`projects/active/[project]/agents/`)
- Holt Context vom ContextManager
- Baut vollständigen Prompt mit:
  - Agent-Spezifikation
  - Projekt-Context
  - Previous Agent Outputs
  - Available Knowledge
  - Constraints

### 4. Output Management
- Speichert Responses als Artifacts im ContextManager
- Tracked Metadata:
  - Token-Usage (input & output)
  - Execution-Time
  - Timestamps
  - Step-Informationen

### 5. Live-Logging
- Progress-Anzeige im Terminal
- Detaillierte Logs für jeden Step
- Execution-Statistics nach Abschluss
- Error-Handling mit Details

## Installation

```bash
# Anthropic SDK installieren
npm install @anthropic-ai/sdk

# Oder mit dem aktualisierten package.json
npm install
```

## Setup

### 1. API Key konfigurieren

```bash
# Linux/Mac
export ANTHROPIC_API_KEY="your-api-key"

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="your-api-key"

# Windows (CMD)
set ANTHROPIC_API_KEY=your-api-key
```

Oder in einer `.env` Datei:

```env
ANTHROPIC_API_KEY=your-api-key
```

### 2. Komponenten initialisieren

```typescript
import { ContextManager } from './orchestrator/context-manager.js';
import { WorkflowEngine } from './orchestrator/workflow-engine.js';
import { AgentExecutor } from './orchestrator/agent-executor.js';

const projectPath = 'projects/active/your-project';
const projectConfig = // ... load from project-config.json

const contextManager = new ContextManager(projectPath);
const workflowEngine = new WorkflowEngine();
const agentExecutor = new AgentExecutor(
  contextManager,
  workflowEngine,
  projectPath,
  projectConfig
);
```

## Verwendung

### Einzelnen Step ausführen

```typescript
const workflow = // ... load from workflow.json
const nextSteps = workflowEngine.getNextSteps(workflow);

if (nextSteps.length > 0) {
  const result = await agentExecutor.executeStep(
    workflow,
    nextSteps[0],
    {
      maxTokens: 4096,
      temperature: 1.0
    }
  );

  console.log('Success:', result.success);
  console.log('Output:', result.output);
  console.log('Tokens:', result.tokensUsed);
}
```

### Mehrere Steps ausführen

```typescript
const nextSteps = workflowEngine.getNextSteps(workflow);

const results = await agentExecutor.executeSteps(
  workflow,
  nextSteps,
  {
    maxTokens: 4096,
    temperature: 1.0
  }
);

// Statistics anzeigen
const stats = agentExecutor.getExecutionStats(results);
console.log('Success rate:', `${stats.successful}/${stats.totalSteps}`);
console.log('Total time:', `${stats.totalTime / 1000}s`);
console.log('Total tokens:', stats.totalTokens);
```

### Kompletten Workflow ausführen

```typescript
const results = await agentExecutor.executeWorkflow(
  workflow,
  {
    maxTokens: 4096,
    temperature: 1.0
  }
);

// Zeigt automatisch Progress und Statistics
```

### Beispiel-Skript ausführen

```bash
# Mit npm script
npm run execute-agents

# Oder direkt mit tsx
npx tsx examples/run-agent-executor.ts
```

## API Referenz

### AgentExecutor Constructor

```typescript
constructor(
  contextManager: ContextManager,
  workflowEngine: WorkflowEngine,
  projectPath: string,
  projectConfig: ProjectConfig,
  apiKey?: string
)
```

**Parameter:**
- `contextManager`: ContextManager Instanz
- `workflowEngine`: WorkflowEngine Instanz
- `projectPath`: Pfad zum Projekt (z.B. `projects/active/my-project`)
- `projectConfig`: Projekt-Konfiguration
- `apiKey`: (Optional) API Key, falls nicht über Umgebungsvariable gesetzt

### executeStep()

```typescript
async executeStep(
  workflow: WorkflowPattern,
  step: WorkflowStep,
  options?: ExecutionOptions
): Promise<AgentExecutionResult>
```

Führt einen einzelnen Workflow-Step aus.

**Returns:** `AgentExecutionResult`
- `stepId`: Step ID
- `agentId`: Agent ID
- `success`: Erfolg/Fehler
- `output`: Agent Output (bei Erfolg)
- `error`: Fehlermeldung (bei Fehler)
- `tokensUsed`: Token-Usage
- `executionTime`: Execution Zeit in ms

### executeSteps()

```typescript
async executeSteps(
  workflow: WorkflowPattern,
  steps: WorkflowStep[],
  options?: ExecutionOptions
): Promise<AgentExecutionResult[]>
```

Führt mehrere Steps sequenziell aus.

### executeWorkflow()

```typescript
async executeWorkflow(
  workflow: WorkflowPattern,
  options?: ExecutionOptions
): Promise<AgentExecutionResult[]>
```

Führt den kompletten Workflow aus.

### getExecutionStats()

```typescript
getExecutionStats(
  results: AgentExecutionResult[]
): ExecutionStats
```

Berechnet Statistics aus Execution Results.

**Returns:** `ExecutionStats`
- `totalSteps`: Anzahl Steps
- `successful`: Erfolgreiche Steps
- `failed`: Fehlgeschlagene Steps
- `totalTime`: Gesamtzeit
- `totalTokens`: Gesamte Tokens
- `averageTimePerStep`: Durchschnittliche Zeit pro Step
- `averageTokensPerStep`: Durchschnittliche Tokens pro Step

## ExecutionOptions

```typescript
interface ExecutionOptions {
  maxTokens?: number;      // Default: 4096
  temperature?: number;    // Default: 1.0
  model?: string;          // Default: 'claude-sonnet-4-20250514'
  streaming?: boolean;     // Default: false
  timeout?: number;        // Default: undefined
}
```

## Output-Format

Der AgentExecutor speichert Outputs als Artifacts im ContextManager mit folgender Struktur:

```typescript
{
  id: 'output-agent-01-output-1234567890',
  type: 'output',
  name: 'agent-01-output',
  content: '... agent response ...',
  createdBy: 'agent-01',
  createdAt: Date,
  updatedAt: Date,
  tags: ['agent-output', 'agent-01', 'agent-01-output'],
  metadata: {
    stepId: 'step-agent-01',
    action: 'Execute Business Strategy Agent for conception phase',
    tokensUsed: { input: 1234, output: 567 },
    timestamp: '2025-01-15T10:30:00.000Z'
  }
}
```

## Error Handling

Der AgentExecutor behandelt Fehler gracefully:

```typescript
const result = await agentExecutor.executeStep(workflow, step);

if (!result.success) {
  console.error('Step failed:', result.error);
  // Step status wird auf 'failed' gesetzt
  // Workflow kann gestoppt oder fortgesetzt werden
}
```

## Logging

Der AgentExecutor gibt detaillierte Logs aus:

```
================================================================================
🤖 Executing: Execute Business Strategy Agent for conception phase
   Agent ID: agent-01
   Step ID: step-agent-01
================================================================================

📄 Loaded agent prompt (4523 chars)
📦 Built agent context:
   - Available knowledge: 0 items
   - Previous outputs: 0 items

🚀 Calling Claude API...
   Model: claude-sonnet-4-20250514
   Max tokens: 4096
   Temperature: 1.0

✅ Response received
   Output length: 3456 chars
   Tokens used: 1234 input, 567 output

💾 Stored artifact: output-agent-01-output-1234567890

✔️  Step completed successfully
   Execution time: 12.34s
================================================================================
```

## Best Practices

1. **API Key Sicherheit**: Niemals API Keys im Code speichern, immer Umgebungsvariablen nutzen

2. **Token Limits**: Bei großen Prompts `maxTokens` erhöhen:
   ```typescript
   { maxTokens: 8192 }
   ```

3. **Error Handling**: Immer `result.success` prüfen:
   ```typescript
   if (!result.success) {
     console.error('Error:', result.error);
   }
   ```

4. **Context**: Sicherstellen dass relevante Artifacts im ContextManager sind:
   ```typescript
   contextManager.storeArtifact(
     'requirement',
     'user-requirements',
     requirements,
     'user-input',
     ['requirement', 'input']
   );
   ```

5. **Workflow Progress**: Progress tracking nutzen:
   ```typescript
   const progress = workflowEngine.getProgress(workflow);
   console.log(`Progress: ${progress.percentage}%`);
   ```

## Troubleshooting

### "ANTHROPIC_API_KEY environment variable is required"
API Key nicht gesetzt. Siehe Setup-Sektion.

### "Agent prompt file not found for agent: agent-01"
Agent Markdown-Datei fehlt in `projects/active/[project]/agents/`

### "Claude API error: ..."
API Fehler. Prüfe:
- API Key korrekt?
- Genug Credits?
- Rate Limits erreicht?

### Steps werden nicht ausgeführt
Prüfe Workflow Dependencies:
```typescript
const nextSteps = workflowEngine.getNextSteps(workflow);
console.log('Next steps:', nextSteps.length);
```

## Integration mit anderen Komponenten

Der AgentExecutor integriert sich nahtlos mit:

- **ContextManager**: Für Artifact Storage und Context Building
- **WorkflowEngine**: Für Workflow Management und Dependencies
- **AgentFactory**: Agents werden aus generierten Markdown-Dateien geladen
- **ProjectAnalyzer**: Project Config wird als Context verwendet

## Nächste Schritte

1. API Key konfigurieren
2. `npm install` ausführen
3. Beispiel-Skript testen: `npm run execute-agents`
4. In eigenen Code integrieren

Bei Fragen oder Problemen siehe Beispiel-Datei: `examples/run-agent-executor.ts`
