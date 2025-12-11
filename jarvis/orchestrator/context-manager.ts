import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { ProjectConfig, AgentContext } from '../shared/types.js';

/**
 * Artifact stored in the knowledge base
 */
export interface Artifact {
  id: string;
  type: string;
  name: string;
  content: unknown;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: Record<string, unknown>;
}

/**
 * ContextManager - Maintains shared project knowledge base
 *
 * This component:
 * - Maintains shared project knowledge base
 * - Routes information between agents
 * - Prevents context duplication
 * - Ensures consistency across agent outputs
 * - Stores and retrieves artifacts
 */
export class ContextManager {
  private projectPath: string;
  private contextPath: string;
  private artifacts: Map<string, Artifact> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.contextPath = join(projectPath, 'context');

    // Ensure context directory exists
    if (!existsSync(this.contextPath)) {
      mkdirSync(this.contextPath, { recursive: true });
    }

    this.loadArtifacts();
  }

  /**
   * Store an artifact in the knowledge base
   */
  public storeArtifact(
    type: string,
    name: string,
    content: unknown,
    createdBy: string,
    tags: string[] = [],
    metadata: Record<string, unknown> = {}
  ): Artifact {
    const id = this.generateArtifactId(type, name);

    const artifact: Artifact = {
      id,
      type,
      name,
      content,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags,
      metadata
    };

    this.artifacts.set(id, artifact);
    this.saveArtifact(artifact);

    return artifact;
  }

  /**
   * Update an existing artifact
   */
  public updateArtifact(
    id: string,
    content: unknown,
    updatedBy: string,
    metadata?: Record<string, unknown>
  ): Artifact | null {
    const artifact = this.artifacts.get(id);

    if (!artifact) {
      return null;
    }

    artifact.content = content;
    artifact.updatedAt = new Date();

    if (metadata) {
      artifact.metadata = { ...artifact.metadata, ...metadata, updatedBy };
    }

    this.saveArtifact(artifact);

    return artifact;
  }

  /**
   * Retrieve an artifact by ID
   */
  public getArtifact(id: string): Artifact | null {
    return this.artifacts.get(id) || null;
  }

  /**
   * Retrieve artifacts by type
   */
  public getArtifactsByType(type: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.type === type);
  }

  /**
   * Retrieve artifacts by tag
   */
  public getArtifactsByTag(tag: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.tags.includes(tag));
  }

  /**
   * Retrieve all artifacts
   */
  public getArtifacts(): Artifact[] {
    return Array.from(this.artifacts.values());
  }

  /**
   * Retrieve artifacts created by specific agent
   */
  public getArtifactsByAgent(agentId: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.createdBy === agentId);
  }

  /**
   * Search artifacts by query
   */
  public searchArtifacts(query: string): Artifact[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.artifacts.values()).filter(artifact => {
      const nameMatch = artifact.name.toLowerCase().includes(lowerQuery);
      const typeMatch = artifact.type.toLowerCase().includes(lowerQuery);
      const tagsMatch = artifact.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      const contentMatch = typeof artifact.content === 'string' &&
        artifact.content.toLowerCase().includes(lowerQuery);

      return nameMatch || typeMatch || tagsMatch || contentMatch;
    });
  }

  /**
   * Build agent context from knowledge base
   */
  public buildAgentContext(
    agentId: string,
    projectConfig: ProjectConfig,
    requiredTags: string[] = []
  ): AgentContext {
    // Get relevant artifacts
    const relevantArtifacts: Record<string, unknown> = {};

    // Include artifacts with required tags
    for (const tag of requiredTags) {
      const artifacts = this.getArtifactsByTag(tag);
      artifacts.forEach(artifact => {
        relevantArtifacts[artifact.id] = artifact.content;
      });
    }

    // Get outputs from other agents
    const previousOutputs: Record<string, unknown> = {};
    const allArtifacts = Array.from(this.artifacts.values());

    allArtifacts.forEach(artifact => {
      if (artifact.createdBy !== agentId && artifact.type === 'output') {
        previousOutputs[artifact.createdBy] = artifact.content;
      }
    });

    return {
      projectContext: projectConfig,
      availableKnowledge: relevantArtifacts,
      previousOutputs,
      constraints: projectConfig.constraints || {}
    };
  }

  /**
   * Export knowledge base summary
   */
  public exportSummary(): {
    totalArtifacts: number;
    artifactsByType: Record<string, number>;
    artifactsByAgent: Record<string, number>;
    recentArtifacts: Artifact[];
  } {
    const artifacts = Array.from(this.artifacts.values());

    const artifactsByType: Record<string, number> = {};
    const artifactsByAgent: Record<string, number> = {};

    artifacts.forEach(artifact => {
      artifactsByType[artifact.type] = (artifactsByType[artifact.type] || 0) + 1;
      artifactsByAgent[artifact.createdBy] = (artifactsByAgent[artifact.createdBy] || 0) + 1;
    });

    const recentArtifacts = artifacts
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);

    return {
      totalArtifacts: artifacts.length,
      artifactsByType,
      artifactsByAgent,
      recentArtifacts
    };
  }

  /**
   * Generate a unique artifact ID
   */
  private generateArtifactId(type: string, name: string): string {
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${type}-${sanitizedName}-${timestamp}`;
  }

  /**
   * Save an artifact to disk
   */
  private saveArtifact(artifact: Artifact): void {
    const filename = `${artifact.id}.json`;
    const filepath = join(this.contextPath, filename);

    writeFileSync(filepath, JSON.stringify(artifact, null, 2), 'utf-8');
  }

  /**
   * Load all artifacts from disk
   */
  private loadArtifacts(): void {
    if (!existsSync(this.contextPath)) {
      return;
    }

    const files = readdirSync(this.contextPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filepath = join(this.contextPath, file);
          const content = readFileSync(filepath, 'utf-8');
          const artifact = JSON.parse(content) as Artifact;

          // Convert date strings back to Date objects
          artifact.createdAt = new Date(artifact.createdAt);
          artifact.updatedAt = new Date(artifact.updatedAt);

          this.artifacts.set(artifact.id, artifact);
        } catch (error) {
          console.error(`Error loading artifact ${file}:`, error);
        }
      }
    }
  }

  /**
   * Clear all artifacts (use with caution)
   */
  public clearArtifacts(): void {
    this.artifacts.clear();

    const files = readdirSync(this.contextPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        unlinkSync(join(this.contextPath, file));
      }
    }
  }

  /**
   * Save project state
   */
  public saveProjectState(state: Record<string, unknown>): void {
    const stateFile = join(this.projectPath, 'project-state.json');
    writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf-8');
  }

  /**
   * Load project state
   */
  public loadProjectState(): Record<string, unknown> | null {
    const stateFile = join(this.projectPath, 'project-state.json');

    if (!existsSync(stateFile)) {
      return null;
    }

    try {
      const content = readFileSync(stateFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading project state:', error);
      return null;
    }
  }
}
