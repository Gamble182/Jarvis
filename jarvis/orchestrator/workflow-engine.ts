import { WorkflowPattern, WorkflowStep, AgentAssignment } from '../shared/types.js';
import { AgentSpec } from './agent-factory.js';

/**
 * WorkflowEngine - Manages task execution order and dependencies
 *
 * This component:
 * - Determines task execution order
 * - Manages dependencies between agents
 * - Handles iterative refinement loops
 * - Tracks project progress across phases
 */
export class WorkflowEngine {
  /**
   * Create a workflow from agent specifications and project phases
   */
  public createWorkflow(
    agents: AgentSpec[],
    phases: string[],
    patternType: 'sequential' | 'parallel' | 'iterative' = 'sequential'
  ): WorkflowPattern {
    switch (patternType) {
      case 'sequential':
        return this.createSequentialWorkflow(agents, phases);
      case 'parallel':
        return this.createParallelWorkflow(agents, phases);
      case 'iterative':
        return this.createIterativeWorkflow(agents, phases);
      default:
        return this.createSequentialWorkflow(agents, phases);
    }
  }

  /**
   * Create a sequential workflow (one agent after another)
   */
  private createSequentialWorkflow(agents: AgentSpec[], phases: string[]): WorkflowPattern {
    const steps: WorkflowStep[] = [];
    const dependencies: Record<string, string[]> = {};

    // Sort agents by phase
    const agentsByPhase = this.groupAgentsByPhase(agents, phases);

    let prevStepId: string | null = null;

    for (const phase of phases) {
      const phaseAgents = agentsByPhase[phase] || [];

      for (const agent of phaseAgents) {
        const stepId = `step-${agent.id}`;

        steps.push({
          id: stepId,
          agentId: agent.id,
          action: `Execute ${agent.name} for ${phase} phase`,
          inputs: prevStepId ? [prevStepId] : [],
          outputs: [`${agent.id}-output`],
          status: 'pending'
        });

        if (prevStepId) {
          dependencies[stepId] = [prevStepId];
        }

        prevStepId = stepId;
      }
    }

    return {
      type: 'sequential',
      steps,
      dependencies
    };
  }

  /**
   * Create a parallel workflow (agents work independently)
   */
  private createParallelWorkflow(agents: AgentSpec[], phases: string[]): WorkflowPattern {
    const steps: WorkflowStep[] = [];
    const dependencies: Record<string, string[]> = {};

    // Group by phase
    const agentsByPhase = this.groupAgentsByPhase(agents, phases);

    let previousPhaseSteps: string[] = [];

    for (const phase of phases) {
      const phaseAgents = agentsByPhase[phase] || [];
      const currentPhaseSteps: string[] = [];

      for (const agent of phaseAgents) {
        const stepId = `step-${agent.id}`;

        steps.push({
          id: stepId,
          agentId: agent.id,
          action: `Execute ${agent.name} for ${phase} phase`,
          inputs: previousPhaseSteps,
          outputs: [`${agent.id}-output`],
          status: 'pending'
        });

        // Each agent in this phase depends on all agents from previous phase
        if (previousPhaseSteps.length > 0) {
          dependencies[stepId] = [...previousPhaseSteps];
        }

        currentPhaseSteps.push(stepId);
      }

      previousPhaseSteps = currentPhaseSteps;
    }

    return {
      type: 'parallel',
      steps,
      dependencies
    };
  }

  /**
   * Create an iterative workflow with review loops
   */
  private createIterativeWorkflow(agents: AgentSpec[], phases: string[]): WorkflowPattern {
    const steps: WorkflowStep[] = [];
    const dependencies: Record<string, string[]> = {};

    const agentsByPhase = this.groupAgentsByPhase(agents, phases);

    for (const phase of phases) {
      const phaseAgents = agentsByPhase[phase] || [];

      // Initial work steps
      const workSteps: string[] = [];
      for (const agent of phaseAgents) {
        const workStepId = `work-${agent.id}`;
        steps.push({
          id: workStepId,
          agentId: agent.id,
          action: `Execute ${agent.name} for ${phase} phase`,
          inputs: [],
          outputs: [`${agent.id}-draft`],
          status: 'pending'
        });
        workSteps.push(workStepId);
      }

      // Review step
      const reviewStepId = `review-${phase}`;
      steps.push({
        id: reviewStepId,
        agentId: 'review-agent',
        action: `Review ${phase} phase outputs`,
        inputs: workSteps,
        outputs: [`${phase}-review-feedback`],
        status: 'pending'
      });
      dependencies[reviewStepId] = workSteps;

      // Refinement step
      const refineStepId = `refine-${phase}`;
      steps.push({
        id: refineStepId,
        agentId: 'refinement-agent',
        action: `Refine ${phase} phase based on feedback`,
        inputs: [reviewStepId],
        outputs: [`${phase}-final`],
        status: 'pending'
      });
      dependencies[refineStepId] = [reviewStepId];
    }

    return {
      type: 'iterative',
      steps,
      dependencies
    };
  }

  /**
   * Group agents by their assigned phase
   */
  private groupAgentsByPhase(agents: AgentSpec[], phases: string[]): Record<string, AgentSpec[]> {
    const grouped: Record<string, AgentSpec[]> = {};

    // Initialize with empty arrays
    phases.forEach(phase => {
      grouped[phase] = [];
    });

    // Group agents
    for (const agent of agents) {
      if (agent.phase === 'all') {
        // Add to all phases
        phases.forEach(phase => {
          grouped[phase].push(agent);
        });
      } else if (grouped[agent.phase]) {
        grouped[agent.phase].push(agent);
      }
    }

    return grouped;
  }

  /**
   * Get next executable steps in the workflow
   */
  public getNextSteps(workflow: WorkflowPattern): WorkflowStep[] {
    const completedSteps = new Set(
      workflow.steps.filter(s => s.status === 'completed').map(s => s.id)
    );

    return workflow.steps.filter(step => {
      // Already completed or in progress
      if (step.status === 'completed' || step.status === 'in-progress') {
        return false;
      }

      // Check if all dependencies are met
      const deps = workflow.dependencies[step.id] || [];
      return deps.every(dep => completedSteps.has(dep));
    });
  }

  /**
   * Mark a step as completed
   */
  public completeStep(workflow: WorkflowPattern, stepId: string): void {
    const step = workflow.steps.find(s => s.id === stepId);
    if (step) {
      step.status = 'completed';
    }
  }

  /**
   * Get workflow progress
   */
  public getProgress(workflow: WorkflowPattern): {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    percentage: number;
  } {
    const total = workflow.steps.length;
    const completed = workflow.steps.filter(s => s.status === 'completed').length;
    const inProgress = workflow.steps.filter(s => s.status === 'in-progress').length;
    const pending = workflow.steps.filter(s => s.status === 'pending').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, percentage };
  }
}
