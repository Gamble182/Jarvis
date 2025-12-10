/**
 * Demo script for the Enhanced Agent Logger
 *
 * Run with: tsx examples/demo-agent-logger.ts
 */

import { AgentLogger, LogLevel } from '../orchestrator/agent-logger';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demonstrateLogger() {
  // Initialize logger with file logging
  const logger = new AgentLogger({
    logLevel: LogLevel.DEBUG,
    enableFileLogging: true,
    logDirectory: './logs',
  });

  console.log('\n');
  logger.section('DEMO: AGENT LOGGER CAPABILITIES');

  // ============================================================================
  // Demo 1: Single Agent Workflow
  // ============================================================================
  logger.info('Starting Demo 1: Single Agent Workflow');
  await sleep(500);

  const dataAgent = {
    id: 'agent-001',
    name: 'DataAnalyzer',
    type: 'analyzer',
  };

  logger.agentStart(dataAgent, 'Initializing data analysis pipeline');
  await sleep(300);

  logger.agentThinking(dataAgent, 'Evaluating dataset structure and identifying patterns...');
  await sleep(400);

  logger.agentAction(dataAgent, 'Loading dataset from source', {
    source: 'PostgreSQL',
    table: 'user_events',
    rows: 15000,
  });
  await sleep(500);

  logger.agentAction(dataAgent, 'Applying data transformations', {
    filters: 3,
    aggregations: 5,
  });
  await sleep(600);

  logger.agentOutput(dataAgent, {
    total_records: 15000,
    processed: 14823,
    invalid: 177,
    insights: {
      peak_hours: [14, 15, 16],
      avg_session_duration: '4.2 minutes',
      top_categories: ['electronics', 'fashion', 'home'],
    },
  }, 'Analysis Results');
  await sleep(300);

  logger.agentSuccess(dataAgent, 'Data analysis completed successfully', {
    duration: '2.3s',
    output_file: 'analysis_results.json',
  });

  await sleep(1000);

  // ============================================================================
  // Demo 2: Multi-Agent Communication
  // ============================================================================
  logger.section('DEMO 2: MULTI-AGENT COMMUNICATION');
  logger.info('Starting multi-agent workflow');
  await sleep(500);

  const coordinator = {
    id: 'coord-01',
    name: 'Coordinator',
    type: 'orchestrator',
  };

  const worker1 = {
    id: 'work-01',
    name: 'Worker-Alpha',
    type: 'executor',
  };

  const worker2 = {
    id: 'work-02',
    name: 'Worker-Beta',
    type: 'executor',
  };

  logger.agentStart(coordinator, 'Initializing distributed processing');
  await sleep(300);

  logger.agentThinking(coordinator, 'Calculating optimal task distribution strategy...');
  await sleep(400);

  logger.agentAction(coordinator, 'Splitting workload', {
    total_tasks: 1000,
    workers: 2,
    strategy: 'round-robin',
  });
  await sleep(300);

  // Coordinator → Worker 1
  logger.agentCommunication(coordinator, worker1, {
    type: 'task_assignment',
    task_id: 'batch-001',
    payload: {
      items: 500,
      priority: 'high',
      deadline: '2024-12-08T12:00:00Z',
    },
  });
  await sleep(200);

  logger.agentStart(worker1, 'Received task assignment');
  await sleep(300);

  // Coordinator → Worker 2
  logger.agentCommunication(coordinator, worker2, {
    type: 'task_assignment',
    task_id: 'batch-002',
    payload: {
      items: 500,
      priority: 'high',
      deadline: '2024-12-08T12:00:00Z',
    },
  });
  await sleep(200);

  logger.agentStart(worker2, 'Received task assignment');
  await sleep(400);

  // Worker 1 processing
  logger.agentThinking(worker1, 'Optimizing processing order for batch-001...');
  await sleep(300);

  logger.agentAction(worker1, 'Processing batch', {
    batch_id: 'batch-001',
    progress: '250/500',
    status: 'in_progress',
  });
  await sleep(600);

  logger.agentAction(worker1, 'Processing batch', {
    batch_id: 'batch-001',
    progress: '500/500',
    status: 'completed',
  });
  await sleep(300);

  // Worker 1 → Coordinator
  logger.agentCommunication(worker1, coordinator, {
    type: 'task_completed',
    task_id: 'batch-001',
    result: {
      processed: 500,
      success: 498,
      failed: 2,
      duration: '3.2s',
    },
  });
  await sleep(200);

  logger.agentSuccess(worker1, 'Batch processing completed');
  await sleep(400);

  // Worker 2 processing
  logger.agentThinking(worker2, 'Analyzing batch-002 complexity...');
  await sleep(300);

  logger.agentAction(worker2, 'Processing batch', {
    batch_id: 'batch-002',
    progress: '500/500',
    status: 'completed',
  });
  await sleep(500);

  // Worker 2 → Coordinator
  logger.agentCommunication(worker2, coordinator, {
    type: 'task_completed',
    task_id: 'batch-002',
    result: {
      processed: 500,
      success: 500,
      failed: 0,
      duration: '2.8s',
    },
  });
  await sleep(200);

  logger.agentSuccess(worker2, 'Batch processing completed');
  await sleep(400);

  logger.agentOutput(coordinator, {
    total_processed: 1000,
    total_success: 998,
    total_failed: 2,
    workers_used: 2,
    total_duration: '6.1s',
  }, 'Workflow Summary');

  logger.agentSuccess(coordinator, 'All tasks completed successfully');

  await sleep(1000);

  // ============================================================================
  // Demo 3: Error Handling
  // ============================================================================
  logger.section('DEMO 3: ERROR HANDLING & WARNINGS');
  logger.info('Demonstrating error handling capabilities');
  await sleep(500);

  const apiAgent = {
    id: 'agent-003',
    name: 'APIClient',
    type: 'client',
  };

  logger.agentStart(apiAgent, 'Fetching data from external API');
  await sleep(300);

  logger.agentAction(apiAgent, 'Sending HTTP request', {
    url: 'https://api.example.com/data',
    method: 'GET',
    timeout: '30s',
  });
  await sleep(500);

  logger.agentWarning(apiAgent, 'Request taking longer than expected', {
    elapsed: '28s',
    timeout: '30s',
  });
  await sleep(300);

  logger.agentError(apiAgent, new Error('Connection timeout after 30s'), {
    url: 'https://api.example.com/data',
    attempt: 1,
    max_retries: 3,
    will_retry: true,
  });
  await sleep(500);

  logger.agentAction(apiAgent, 'Retrying with exponential backoff', {
    attempt: 2,
    backoff: '2s',
  });
  await sleep(400);

  logger.agentWarning(apiAgent, 'Received partial response', {
    expected_fields: 10,
    received_fields: 7,
    missing: ['address', 'phone', 'email'],
  });
  await sleep(300);

  logger.agentSuccess(apiAgent, 'Data retrieved with warnings', {
    status: 'partial_success',
    completeness: '70%',
  });

  await sleep(1000);

  // ============================================================================
  // Demo 4: Debug Mode
  // ============================================================================
  logger.section('DEMO 4: DEBUG MODE');
  logger.info('Demonstrating debug-level logging');
  await sleep(500);

  const debugAgent = {
    id: 'agent-004',
    name: 'DebugAgent',
    type: 'debugger',
  };

  logger.agentStart(debugAgent, 'Running in debug mode');
  await sleep(300);

  logger.debug('Internal state snapshot', {
    memory_usage: '45MB',
    cache_size: 1024,
    active_connections: 5,
  });
  await sleep(200);

  logger.agentThinking(debugAgent, 'Analyzing execution path and bottlenecks...');
  await sleep(300);

  logger.debug('Performance metrics', {
    avg_response_time: '120ms',
    p95_response_time: '450ms',
    throughput: '850 req/s',
  });
  await sleep(300);

  logger.agentSuccess(debugAgent, 'Debug session completed');

  await sleep(1000);

  // ============================================================================
  // Session Summary
  // ============================================================================
  logger.printSessionSummary();

  console.log('\n');
  logger.info('Demo completed! Check the ./logs directory for the log file.');
  console.log('\n');
}

// Run the demo
demonstrateLogger().catch(console.error);
