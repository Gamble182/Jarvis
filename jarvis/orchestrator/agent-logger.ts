import chalk from 'chalk';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Log levels for filtering output
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Configuration options for the AgentLogger
 */
export interface AgentLoggerConfig {
  /** Minimum log level to display (default: INFO) */
  logLevel?: LogLevel;
  /** Enable file logging (default: false) */
  enableFileLogging?: boolean;
  /** Directory for log files (default: './logs') */
  logDirectory?: string;
  /** Enable timestamps (default: true) */
  showTimestamps?: boolean;
  /** Enable colored output (default: true) */
  enableColors?: boolean;
  /** Maximum width for separator lines (default: 80) */
  separatorWidth?: number;
}

/**
 * Agent execution data for structured logging
 */
export interface AgentInfo {
  id: string;
  name: string;
  type?: string;
  status?: 'running' | 'success' | 'error' | 'idle';
}

/**
 * Enhanced Logger for beautiful terminal logging of Agent activities
 *
 * @example
 * ```typescript
 * // Basic usage
 * const logger = new AgentLogger();
 *
 * logger.agentStart({ id: 'agent-001', name: 'DataAnalyzer' });
 * logger.agentThinking({ id: 'agent-001', name: 'DataAnalyzer' }, 'Analyzing dataset patterns...');
 * logger.agentAction({ id: 'agent-001', name: 'DataAnalyzer' }, 'Loading CSV file', { file: 'data.csv' });
 * logger.agentOutput({ id: 'agent-001', name: 'DataAnalyzer' }, { rows: 1000, columns: 15 });
 * logger.agentSuccess({ id: 'agent-001', name: 'DataAnalyzer' }, 'Analysis complete');
 *
 * // Agent communication
 * logger.agentCommunication(
 *   { id: 'agent-001', name: 'DataAnalyzer' },
 *   { id: 'agent-002', name: 'ReportGenerator' },
 *   { type: 'data', payload: 'analysis results' }
 * );
 *
 * // With file logging
 * const fileLogger = new AgentLogger({
 *   enableFileLogging: true,
 *   logDirectory: './logs',
 *   logLevel: LogLevel.DEBUG
 * });
 *
 * // Error handling
 * try {
 *   // ... agent execution
 * } catch (error) {
 *   logger.agentError({ id: 'agent-001', name: 'DataAnalyzer' }, error);
 * }
 * ```
 */
export class AgentLogger {
  private config: Required<AgentLoggerConfig>;
  private logFilePath?: string;
  private sessionStartTime: Date;

  constructor(config: AgentLoggerConfig = {}) {
    this.config = {
      logLevel: config.logLevel ?? LogLevel.INFO,
      enableFileLogging: config.enableFileLogging ?? false,
      logDirectory: config.logDirectory ?? './logs',
      showTimestamps: config.showTimestamps ?? true,
      enableColors: config.enableColors ?? true,
      separatorWidth: config.separatorWidth ?? 80,
    };

    this.sessionStartTime = new Date();

    if (this.config.enableFileLogging) {
      this.initializeFileLogging();
    }
  }

  /**
   * Initialize file logging system
   */
  private initializeFileLogging(): void {
    if (!existsSync(this.config.logDirectory)) {
      mkdirSync(this.config.logDirectory, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFilePath = join(this.config.logDirectory, `agent-log-${timestamp}.log`);

    const header = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        AGENT EXECUTION LOG SESSION                            ║
║                     Started: ${new Date().toISOString()}                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`;
    writeFileSync(this.logFilePath, header + '\n');
  }

  /**
   * Write to log file if file logging is enabled
   */
  private writeToFile(message: string): void {
    if (this.config.enableFileLogging && this.logFilePath) {
      const timestamp = new Date().toISOString();
      appendFileSync(this.logFilePath, `[${timestamp}] ${message}\n`);
    }
  }

  /**
   * Get timestamp string
   */
  private getTimestamp(): string {
    if (!this.config.showTimestamps) return '';
    const now = new Date();
    const time = now.toLocaleTimeString('de-DE', { hour12: false });
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return this.config.enableColors
      ? chalk.gray(`[${time}.${ms}]`)
      : `[${time}.${ms}]`;
  }

  /**
   * Create a separator line
   */
  private separator(char: string = '─', color: (str: string) => string = chalk.gray): string {
    const line = char.repeat(this.config.separatorWidth);
    return this.config.enableColors ? color(line) : line;
  }

  /**
   * Format agent identifier
   */
  private formatAgentId(agent: AgentInfo): string {
    const idStr = `[${agent.id}]`;
    const nameStr = agent.name;
    const typeStr = agent.type ? ` (${agent.type})` : '';

    if (this.config.enableColors) {
      return `${chalk.cyan(idStr)} ${chalk.bold.white(nameStr)}${chalk.gray(typeStr)}`;
    }
    return `${idStr} ${nameStr}${typeStr}`;
  }

  /**
   * Format JSON output with indentation
   */
  private formatJSON(data: any): string {
    try {
      const json = JSON.stringify(data, null, 2);
      if (this.config.enableColors) {
        // Simple JSON colorization
        return json
          .split('\n')
          .map(line => {
            if (line.includes(':')) {
              const [key, ...value] = line.split(':');
              return chalk.blue(key) + ':' + chalk.yellow(value.join(':'));
            }
            return chalk.gray(line);
          })
          .join('\n');
      }
      return json;
    } catch {
      return String(data);
    }
  }

  /**
   * Check if message should be logged based on log level
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.logLevel;
  }

  /**
   * Log agent start
   */
  agentStart(agent: AgentInfo, additionalInfo?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const emoji = '🤖';
    const timestamp = this.getTimestamp();
    const agentId = this.formatAgentId(agent);
    const info = additionalInfo ? ` ${chalk.gray('•')} ${additionalInfo}` : '';

    console.log('\n' + this.separator('═', chalk.green));
    const message = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.green.bold('AGENT START') : 'AGENT START'} ${agentId}${info}`;
    console.log(message);
    console.log(this.separator('─', chalk.green));

    this.writeToFile(`AGENT START: ${agent.id} (${agent.name}) ${additionalInfo || ''}`);
  }

  /**
   * Log agent thinking/reasoning
   */
  agentThinking(agent: AgentInfo, thought: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const emoji = '💭';
    const timestamp = this.getTimestamp();
    const agentId = this.formatAgentId(agent);

    const message = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.magenta('THINKING') : 'THINKING'} ${agentId}`;
    console.log(message);

    const thoughtText = this.config.enableColors ? chalk.italic.gray(`   "${thought}"`) : `   "${thought}"`;
    console.log(thoughtText);

    this.writeToFile(`THINKING: ${agent.id} - ${thought}`);
  }

  /**
   * Log agent action
   */
  agentAction(agent: AgentInfo, action: string, details?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const emoji = '📋';
    const timestamp = this.getTimestamp();
    const agentId = this.formatAgentId(agent);

    const message = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.blue('ACTION') : 'ACTION'} ${agentId}`;
    console.log(message);

    const actionText = this.config.enableColors ? chalk.blue(`   ➜ ${action}`) : `   → ${action}`;
    console.log(actionText);

    if (details) {
      const detailsText = Object.entries(details)
        .map(([key, value]) => {
          const keyStr = this.config.enableColors ? chalk.cyan(`     • ${key}:`) : `     • ${key}:`;
          const valueStr = this.config.enableColors ? chalk.white(String(value)) : String(value);
          return `${keyStr} ${valueStr}`;
        })
        .join('\n');
      console.log(detailsText);
    }

    this.writeToFile(`ACTION: ${agent.id} - ${action} ${details ? JSON.stringify(details) : ''}`);
  }

  /**
   * Log agent output/result
   */
  agentOutput(agent: AgentInfo, output: any, label?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const emoji = '✨';
    const timestamp = this.getTimestamp();
    const agentId = this.formatAgentId(agent);
    const outputLabel = label || 'Output';

    const message = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.yellow('OUTPUT') : 'OUTPUT'} ${agentId} ${this.config.enableColors ? chalk.gray(`• ${outputLabel}`) : `• ${outputLabel}`}`;
    console.log(message);

    const formattedOutput = this.formatJSON(output);
    console.log(formattedOutput.split('\n').map(line => `   ${line}`).join('\n'));

    this.writeToFile(`OUTPUT: ${agent.id} - ${outputLabel}: ${JSON.stringify(output)}`);
  }

  /**
   * Log agent-to-agent communication
   */
  agentCommunication(from: AgentInfo, to: AgentInfo, message: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const emoji = '📨';
    const timestamp = this.getTimestamp();
    const fromId = this.formatAgentId(from);
    const toId = this.formatAgentId(to);

    const arrow = this.config.enableColors ? chalk.yellow(' → ') : ' → ';
    const header = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.yellow('COMMUNICATION') : 'COMMUNICATION'}`;
    console.log(header);
    console.log(`   ${fromId}${arrow}${toId}`);

    const formattedMessage = this.formatJSON(message);
    console.log(formattedMessage.split('\n').map(line => `   ${line}`).join('\n'));

    this.writeToFile(`COMMUNICATION: ${from.id} → ${to.id}: ${JSON.stringify(message)}`);
  }

  /**
   * Log agent success
   */
  agentSuccess(agent: AgentInfo, message?: string, result?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const emoji = '✅';
    const timestamp = this.getTimestamp();
    const agentId = this.formatAgentId(agent);
    const msg = message || 'Completed successfully';

    const header = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.green.bold('SUCCESS') : 'SUCCESS'} ${agentId}`;
    console.log(header);

    const successMsg = this.config.enableColors ? chalk.green(`   ✓ ${msg}`) : `   ✓ ${msg}`;
    console.log(successMsg);

    if (result) {
      const formattedResult = this.formatJSON(result);
      console.log(formattedResult.split('\n').map(line => `   ${line}`).join('\n'));
    }

    console.log(this.separator('═', chalk.green));

    this.writeToFile(`SUCCESS: ${agent.id} - ${msg} ${result ? JSON.stringify(result) : ''}`);
  }

  /**
   * Log agent error
   */
  agentError(agent: AgentInfo, error: Error | string, details?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const emoji = '❌';
    const timestamp = this.getTimestamp();
    const agentId = this.formatAgentId(agent);
    const errorMsg = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const header = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.red.bold('ERROR') : 'ERROR'} ${agentId}`;
    console.log(header);

    const errMsg = this.config.enableColors ? chalk.red(`   ✗ ${errorMsg}`) : `   ✗ ${errorMsg}`;
    console.log(errMsg);

    if (details) {
      const detailsText = Object.entries(details)
        .map(([key, value]) => {
          const keyStr = this.config.enableColors ? chalk.red(`     • ${key}:`) : `     • ${key}:`;
          const valueStr = this.config.enableColors ? chalk.white(String(value)) : String(value);
          return `${keyStr} ${valueStr}`;
        })
        .join('\n');
      console.log(detailsText);
    }

    if (stack && this.config.logLevel === LogLevel.DEBUG) {
      console.log(this.config.enableColors ? chalk.gray(stack) : stack);
    }

    console.log(this.separator('═', chalk.red));

    this.writeToFile(`ERROR: ${agent.id} - ${errorMsg} ${details ? JSON.stringify(details) : ''} ${stack || ''}`);
  }

  /**
   * Log warning message
   */
  agentWarning(agent: AgentInfo, message: string, details?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const emoji = '⚠️';
    const timestamp = this.getTimestamp();
    const agentId = this.formatAgentId(agent);

    const header = `${timestamp} ${emoji} ${this.config.enableColors ? chalk.yellow.bold('WARNING') : 'WARNING'} ${agentId}`;
    console.log(header);

    const warnMsg = this.config.enableColors ? chalk.yellow(`   ⚠ ${message}`) : `   ⚠ ${message}`;
    console.log(warnMsg);

    if (details) {
      const detailsText = Object.entries(details)
        .map(([key, value]) => {
          const keyStr = this.config.enableColors ? chalk.yellow(`     • ${key}:`) : `     • ${key}:`;
          const valueStr = this.config.enableColors ? chalk.white(String(value)) : String(value);
          return `${keyStr} ${valueStr}`;
        })
        .join('\n');
      console.log(detailsText);
    }

    this.writeToFile(`WARNING: ${agent.id} - ${message} ${details ? JSON.stringify(details) : ''}`);
  }

  /**
   * Log debug information
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const timestamp = this.getTimestamp();
    const msg = this.config.enableColors ? chalk.gray(`${timestamp} 🔍 DEBUG: ${message}`) : `${timestamp} DEBUG: ${message}`;
    console.log(msg);

    if (data) {
      console.log(this.config.enableColors ? chalk.gray(JSON.stringify(data, null, 2)) : JSON.stringify(data, null, 2));
    }

    this.writeToFile(`DEBUG: ${message} ${data ? JSON.stringify(data) : ''}`);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const timestamp = this.getTimestamp();
    const msg = this.config.enableColors ? chalk.blue(`${timestamp} ℹ️  INFO: ${message}`) : `${timestamp} INFO: ${message}`;
    console.log(msg);

    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }

    this.writeToFile(`INFO: ${message} ${data ? JSON.stringify(data) : ''}`);
  }

  /**
   * Create a custom separator for organizing output
   */
  section(title: string): void {
    console.log('\n' + this.separator('═', chalk.cyan));
    const titleStr = this.config.enableColors ? chalk.cyan.bold(`  ${title}  `) : `  ${title}  `;
    console.log(titleStr);
    console.log(this.separator('═', chalk.cyan));
  }

  /**
   * Get session summary
   */
  getSessionSummary(): { duration: number; startTime: Date; logFile?: string } {
    const duration = Date.now() - this.sessionStartTime.getTime();
    return {
      duration,
      startTime: this.sessionStartTime,
      logFile: this.logFilePath,
    };
  }

  /**
   * Print session summary
   */
  printSessionSummary(): void {
    const summary = this.getSessionSummary();
    const durationSeconds = (summary.duration / 1000).toFixed(2);

    console.log('\n' + this.separator('═', chalk.blue));
    const header = this.config.enableColors ? chalk.blue.bold('SESSION SUMMARY') : 'SESSION SUMMARY';
    console.log(`  ${header}`);
    console.log(this.separator('─', chalk.blue));

    const items = [
      `Started: ${summary.startTime.toLocaleString('de-DE')}`,
      `Duration: ${durationSeconds}s`,
    ];

    if (summary.logFile) {
      items.push(`Log File: ${summary.logFile}`);
    }

    items.forEach(item => {
      const itemStr = this.config.enableColors ? chalk.white(`  ${item}`) : `  ${item}`;
      console.log(itemStr);
    });

    console.log(this.separator('═', chalk.blue) + '\n');
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example 1: Basic usage
 *
 * ```typescript
 * import { AgentLogger } from './agent-logger';
 *
 * const logger = new AgentLogger();
 *
 * const agent = { id: 'agent-001', name: 'DataProcessor', type: 'analyzer' };
 *
 * logger.agentStart(agent, 'Processing user data');
 * logger.agentThinking(agent, 'Determining optimal processing strategy...');
 * logger.agentAction(agent, 'Loading dataset', { source: 'database', rows: 5000 });
 * logger.agentOutput(agent, {
 *   processed: 5000,
 *   errors: 0,
 *   duration: '2.3s'
 * }, 'Processing Results');
 * logger.agentSuccess(agent, 'Data processing completed');
 * ```
 */

/**
 * Example 2: Multi-agent communication
 *
 * ```typescript
 * import { AgentLogger, LogLevel } from './agent-logger';
 *
 * const logger = new AgentLogger({
 *   logLevel: LogLevel.DEBUG,
 *   enableFileLogging: true
 * });
 *
 * const coordinator = { id: 'coord-01', name: 'Coordinator', type: 'orchestrator' };
 * const worker1 = { id: 'work-01', name: 'Worker-1', type: 'executor' };
 * const worker2 = { id: 'work-02', name: 'Worker-2', type: 'executor' };
 *
 * logger.section('MULTI-AGENT WORKFLOW');
 *
 * logger.agentStart(coordinator, 'Initializing workflow');
 * logger.agentAction(coordinator, 'Distributing tasks', { workers: 2 });
 *
 * logger.agentCommunication(coordinator, worker1, {
 *   task: 'process_batch_1',
 *   data: { batch_id: 1, size: 100 }
 * });
 *
 * logger.agentStart(worker1, 'Received task from coordinator');
 * logger.agentThinking(worker1, 'Processing batch 1...');
 * logger.agentAction(worker1, 'Processing items', { progress: '50/100' });
 *
 * logger.agentCommunication(worker1, coordinator, {
 *   status: 'completed',
 *   result: { processed: 100, success: true }
 * });
 *
 * logger.agentSuccess(worker1, 'Batch 1 completed');
 * logger.agentSuccess(coordinator, 'All tasks completed');
 *
 * logger.printSessionSummary();
 * ```
 */

/**
 * Example 3: Error handling
 *
 * ```typescript
 * import { AgentLogger } from './agent-logger';
 *
 * const logger = new AgentLogger();
 * const agent = { id: 'agent-003', name: 'APIClient', type: 'client' };
 *
 * logger.agentStart(agent, 'Fetching data from API');
 *
 * try {
 *   logger.agentAction(agent, 'Sending HTTP request', {
 *     url: 'https://api.example.com/data',
 *     method: 'GET'
 *   });
 *
 *   // Simulated error
 *   throw new Error('Connection timeout after 30s');
 *
 * } catch (error) {
 *   logger.agentError(agent, error as Error, {
 *     url: 'https://api.example.com/data',
 *     attempt: 3,
 *     maxRetries: 3
 *   });
 * }
 * ```
 */

/**
 * Example 4: Integration with Agent Executor
 *
 * ```typescript
 * import { AgentLogger } from './agent-logger';
 * import { AgentExecutor } from './agent-executor';
 *
 * const logger = new AgentLogger({
 *   enableFileLogging: true,
 *   logDirectory: './execution-logs'
 * });
 *
 * const executor = new AgentExecutor(apiKey, projectContext);
 *
 * logger.section('AGENT EXECUTION');
 *
 * const agent = { id: executor.agentId, name: 'CodeAnalyzer', type: 'executor' };
 *
 * logger.agentStart(agent, 'Starting code analysis');
 *
 * executor.on('thinking', (thought) => {
 *   logger.agentThinking(agent, thought);
 * });
 *
 * executor.on('action', (action, details) => {
 *   logger.agentAction(agent, action, details);
 * });
 *
 * const result = await executor.execute('Analyze code quality');
 *
 * if (result.success) {
 *   logger.agentOutput(agent, result.data, 'Analysis Result');
 *   logger.agentSuccess(agent, 'Analysis completed successfully');
 * } else {
 *   logger.agentError(agent, result.error);
 * }
 *
 * logger.printSessionSummary();
 * ```
 */
