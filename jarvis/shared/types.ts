// Core type definitions for the adaptive agent system

export interface ProjectConfig {
  projectName: string;
  projectType: string;
  domains: string[];
  requiredCapabilities: string[];
  phases: string[];
  constraints: {
    budget?: string;
    timeline?: string;
    technicalComplexity?: string;
    regulatoryRequirements?: string[];
  };
  context?: Record<string, unknown>;
}

export interface CapabilityDefinition {
  name: string;
  category: 'technical' | 'business' | 'creative' | 'legal' | 'research';
  domainKnowledge: string[];
  thinkingPatterns: string[];
  outputFormats: string[];
  requiredContext: string[];
  collaboration: {
    providesTo: string[];
    receivesFrom: string[];
  };
}

export interface AgentAssignment {
  agentId: string;
  capabilities: string[];
  phase: string | 'all';
  context: string;
  status: 'pending' | 'active' | 'completed';
}

export interface ProjectAnalysis {
  projectType: string;
  domains: string[];
  complexity: 'low' | 'medium' | 'high';
  requiredCapabilities: string[];
  suggestedPhases: string[];
  extractedRequirements: Requirement[];
  risks: string[];
}

export interface Requirement {
  id: string;
  category: string;
  description: string;
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  relatedCapabilities: string[];
}

export interface WorkflowPattern {
  type: 'sequential' | 'parallel' | 'iterative';
  steps: WorkflowStep[];
  dependencies: Record<string, string[]>;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  action: string;
  inputs: string[];
  outputs: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface AgentContext {
  projectContext: ProjectConfig;
  availableKnowledge: Record<string, unknown>;
  previousOutputs: Record<string, unknown>;
  constraints: Record<string, unknown>;
}
