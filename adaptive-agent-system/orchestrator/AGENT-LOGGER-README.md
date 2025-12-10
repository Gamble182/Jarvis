# Agent Logger - Enhanced Terminal Logging

Ein professioneller Logger für das Adaptive Agent System mit farbiger Konsolen-Ausgabe und strukturierter Protokollierung.

## Features

- ✅ **Farbige Terminal-Ausgabe** mit Emojis für bessere Lesbarkeit
- 📝 **Strukturierte Logs** mit Zeitstempeln
- 📁 **Datei-Logging** (optional) mit automatischer Session-Organisation
- 🔍 **Log-Levels** (DEBUG, INFO, WARN, ERROR)
- 🤖 **Spezialisierte Agent-Methoden** für alle Aktivitäten
- 📨 **Agent-zu-Agent Kommunikation** Tracking
- ⚡ **Performance-optimiert** mit minimaler Overhead
- 🎨 **Konfigurierbar** (Farben, Breite, Timestamps, etc.)

## Installation

Der Logger ist bereits im Projekt integriert. Die `chalk` Dependency ist installiert.

## Schnellstart

### Basic Usage

```typescript
import { AgentLogger } from './orchestrator/agent-logger';

// Logger initialisieren
const logger = new AgentLogger();

// Agent definieren
const agent = {
  id: 'agent-001',
  name: 'DataProcessor',
  type: 'analyzer'
};

// Agent-Aktivitäten loggen
logger.agentStart(agent, 'Starting data processing');
logger.agentThinking(agent, 'Analyzing data patterns...');
logger.agentAction(agent, 'Loading dataset', { rows: 1000 });
logger.agentOutput(agent, { processed: 1000, errors: 0 });
logger.agentSuccess(agent, 'Processing complete');
```

### Mit Datei-Logging

```typescript
const logger = new AgentLogger({
  enableFileLogging: true,
  logDirectory: './logs',
  logLevel: LogLevel.DEBUG
});
```

## API Referenz

### Logger-Konfiguration

```typescript
interface AgentLoggerConfig {
  logLevel?: LogLevel;              // Minimum Log-Level (default: INFO)
  enableFileLogging?: boolean;      // Datei-Logging aktivieren (default: false)
  logDirectory?: string;            // Log-Verzeichnis (default: './logs')
  showTimestamps?: boolean;         // Zeitstempel anzeigen (default: true)
  enableColors?: boolean;           // Farbige Ausgabe (default: true)
  separatorWidth?: number;          // Breite der Trennlinien (default: 80)
}
```

### Agent-Methoden

#### `agentStart(agent, additionalInfo?)`
Loggt den Start eines Agents mit 🤖 Emoji.

```typescript
logger.agentStart({ id: 'agent-001', name: 'Worker' }, 'Initialization');
```

#### `agentThinking(agent, thought)`
Loggt Agent-Reasoning/Thinking mit 💭 Emoji.

```typescript
logger.agentThinking(agent, 'Evaluating options...');
```

#### `agentAction(agent, action, details?)`
Loggt Agent-Aktionen mit 📋 Emoji.

```typescript
logger.agentAction(agent, 'Processing data', {
  source: 'database',
  rows: 5000
});
```

#### `agentOutput(agent, output, label?)`
Loggt Agent-Outputs mit ✨ Emoji (formatiert als JSON).

```typescript
logger.agentOutput(agent, {
  total: 1000,
  processed: 998,
  errors: 2
}, 'Results');
```

#### `agentCommunication(from, to, message)`
Loggt Agent-zu-Agent Kommunikation mit 📨 Emoji.

```typescript
logger.agentCommunication(
  { id: 'agent-001', name: 'Coordinator' },
  { id: 'agent-002', name: 'Worker' },
  { type: 'task', payload: { id: 'task-123' } }
);
```

#### `agentSuccess(agent, message?, result?)`
Loggt erfolgreichen Agent-Abschluss mit ✅ Emoji.

```typescript
logger.agentSuccess(agent, 'Task completed', { duration: '2.3s' });
```

#### `agentError(agent, error, details?)`
Loggt Agent-Fehler mit ❌ Emoji.

```typescript
try {
  // ... agent execution
} catch (error) {
  logger.agentError(agent, error, { context: 'data processing' });
}
```

#### `agentWarning(agent, message, details?)`
Loggt Agent-Warnungen mit ⚠️ Emoji.

```typescript
logger.agentWarning(agent, 'Timeout approaching', {
  elapsed: '28s',
  timeout: '30s'
});
```

### Utility-Methoden

#### `section(title)`
Erstellt einen Abschnitts-Separator.

```typescript
logger.section('DATA PROCESSING PHASE');
```

#### `debug(message, data?)`
Debug-Level Logging.

```typescript
logger.debug('Internal state', { memory: '45MB', cache: 1024 });
```

#### `info(message, data?)`
Info-Level Logging.

```typescript
logger.info('Starting workflow', { agents: 5 });
```

#### `printSessionSummary()`
Gibt eine Session-Zusammenfassung aus.

```typescript
logger.printSessionSummary();
// Ausgabe:
// ═══════════════════════════════════════════════════════════════════
//   SESSION SUMMARY
// ───────────────────────────────────────────────────────────────────
//   Started: 8.12.2024, 10:51:27
//   Duration: 17.21s
//   Log File: logs/agent-log-2025-12-08T09-51-27-747Z.log
// ═══════════════════════════════════════════════════════════════════
```

## Log-Levels

```typescript
enum LogLevel {
  DEBUG = 0,    // Alle Meldungen
  INFO = 1,     // Info, Warning, Error
  WARN = 2,     // Warning und Error
  ERROR = 3     // Nur Errors
}
```

## Verwendung mit Agent Executor

Integration in bestehende Agent-Systeme:

```typescript
import { AgentLogger, LogLevel } from './orchestrator/agent-logger';
import { AgentExecutor } from './orchestrator/agent-executor';

const logger = new AgentLogger({
  enableFileLogging: true,
  logLevel: LogLevel.DEBUG
});

const executor = new AgentExecutor(apiKey, projectContext);
const agent = {
  id: executor.agentId,
  name: 'CodeAnalyzer',
  type: 'executor'
};

logger.agentStart(agent, 'Starting code analysis');

// Event-basiertes Logging
executor.on('thinking', (thought) => {
  logger.agentThinking(agent, thought);
});

executor.on('action', (action, details) => {
  logger.agentAction(agent, action, details);
});

// Ausführung
try {
  const result = await executor.execute('Analyze code quality');

  if (result.success) {
    logger.agentOutput(agent, result.data);
    logger.agentSuccess(agent, 'Analysis completed');
  } else {
    logger.agentError(agent, result.error);
  }
} catch (error) {
  logger.agentError(agent, error);
}

logger.printSessionSummary();
```

## Multi-Agent Workflow Beispiel

```typescript
const logger = new AgentLogger({
  enableFileLogging: true,
  logDirectory: './workflow-logs'
});

// Koordinator startet
const coordinator = { id: 'coord-01', name: 'Coordinator' };
logger.agentStart(coordinator, 'Initializing workflow');

// Tasks verteilen
const worker1 = { id: 'work-01', name: 'Worker-1' };
const worker2 = { id: 'work-02', name: 'Worker-2' };

logger.agentAction(coordinator, 'Distributing tasks', { workers: 2 });

// Kommunikation loggen
logger.agentCommunication(coordinator, worker1, {
  task: 'process_batch_1',
  priority: 'high'
});

// Worker-Aktivitäten
logger.agentStart(worker1, 'Received task');
logger.agentThinking(worker1, 'Planning execution strategy...');
logger.agentAction(worker1, 'Processing batch', { progress: '50/100' });

// Ergebnis zurück an Koordinator
logger.agentCommunication(worker1, coordinator, {
  status: 'completed',
  result: { processed: 100 }
});

logger.agentSuccess(worker1, 'Batch completed');
logger.agentSuccess(coordinator, 'All tasks completed');

logger.printSessionSummary();
```

## Output-Beispiele

### Terminal-Ausgabe

```
════════════════════════════════════════════════════════════════════
[10:51:28.277] 🤖 AGENT START [agent-001] DataAnalyzer (analyzer)
────────────────────────────────────────────────────────────────────
[10:51:28.592] 💭 THINKING [agent-001] DataAnalyzer (analyzer)
   "Evaluating dataset structure and identifying patterns..."

[10:51:29.007] 📋 ACTION [agent-001] DataAnalyzer (analyzer)
   ➜ Loading dataset from source
     • source: PostgreSQL
     • table: user_events
     • rows: 15000

[10:51:30.121] ✨ OUTPUT [agent-001] DataAnalyzer (analyzer) • Results
   {
     "total_records": 15000,
     "processed": 14823,
     "invalid": 177
   }

[10:51:30.434] ✅ SUCCESS [agent-001] DataAnalyzer (analyzer)
   ✓ Data analysis completed successfully
════════════════════════════════════════════════════════════════════
```

### Log-Datei Format

```
[2025-12-08T09:51:28.277Z] AGENT START: agent-001 (DataAnalyzer) Initializing
[2025-12-08T09:51:28.592Z] THINKING: agent-001 - Evaluating dataset structure...
[2025-12-08T09:51:29.007Z] ACTION: agent-001 - Loading dataset {"source":"PostgreSQL","rows":15000}
[2025-12-08T09:51:30.121Z] OUTPUT: agent-001 - Results: {"total_records":15000,"processed":14823}
[2025-12-08T09:51:30.434Z] SUCCESS: agent-001 - Data analysis completed successfully
```

## Demo ausführen

```bash
# Demo-Skript ausführen
cd adaptive-agent-system
npx tsx examples/demo-agent-logger.ts

# Log-Dateien ansehen
ls -lh logs/
cat logs/agent-log-*.log
```

## Best Practices

1. **Strukturierte Logging**: Nutze die spezialisierten Methoden für verschiedene Agent-Aktivitäten
2. **Log-Levels**: Setze DEBUG nur für Entwicklung, INFO für Production
3. **Datei-Logging**: Aktiviere für wichtige Workflows zur späteren Analyse
4. **Agent-Info**: Gib immer ID, Name und optional Type mit
5. **Details-Parameter**: Nutze für zusätzlichen Kontext bei Actions und Errors
6. **Session Summary**: Rufe am Ende auf für Übersicht über Ausführungszeit

## Fehlerbehandlung

```typescript
const logger = new AgentLogger();
const agent = { id: 'agent-001', name: 'DataProcessor' };

try {
  logger.agentStart(agent);
  logger.agentAction(agent, 'Processing data');

  // ... processing logic

  logger.agentSuccess(agent, 'Processing complete');

} catch (error) {
  logger.agentError(agent, error, {
    phase: 'data_processing',
    input_size: 1000,
    processed: 450
  });

  // Optional: Weitere Aktionen
  logger.agentAction(agent, 'Initiating rollback');
}
```

## Performance

- Minimaler Overhead durch bedingte Ausgabe basierend auf Log-Level
- Asynchrones Datei-Logging (non-blocking)
- Effiziente String-Formatierung
- Cached Farbkonfigurationen

## Anpassung

### Farben deaktivieren

```typescript
const logger = new AgentLogger({
  enableColors: false
});
```

### Breite anpassen

```typescript
const logger = new AgentLogger({
  separatorWidth: 120  // Für breitere Terminals
});
```

### Timestamps ausblenden

```typescript
const logger = new AgentLogger({
  showTimestamps: false
});
```

## Integration mit CI/CD

Im CI/CD-Umfeld:

```typescript
const logger = new AgentLogger({
  enableColors: process.stdout.isTTY,  // Farben nur im Terminal
  enableFileLogging: true,             // Immer in Datei schreiben
  logDirectory: process.env.LOG_DIR || './logs'
});
```

## Erweiterung

Der Logger kann leicht erweitert werden:

```typescript
class CustomAgentLogger extends AgentLogger {
  agentMetrics(agent: AgentInfo, metrics: Record<string, number>) {
    const timestamp = this.getTimestamp();
    console.log(`${timestamp} 📊 METRICS ${this.formatAgentId(agent)}`);
    // ... custom implementation
  }
}
```

## Support

Bei Fragen oder Problemen siehe:
- Beispiele in `examples/demo-agent-logger.ts`
- Code-Kommentare in `orchestrator/agent-logger.ts`
- Agent Executor Integration in `orchestrator/agent-executor.ts`
