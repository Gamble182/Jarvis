import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ProjectAnalysis, CapabilityDefinition, AgentAssignment } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * CapabilityMatcher - Maps project needs to available capabilities
 *
 * This component:
 * - Loads capability definitions from markdown files
 * - Matches project requirements to capabilities
 * - Creates optimal agent team composition
 * - Handles capability gaps
 * - Validates completeness of agent team
 */
export class CapabilityMatcher {
  private capabilities: Map<string, CapabilityDefinition> = new Map();
  private capabilitiesPath: string;

  constructor() {
    this.capabilitiesPath = join(__dirname, '../agent-pool/capabilities');
    this.loadCapabilities();
  }

  /**
   * Load all capability definitions from markdown files
   */
  private loadCapabilities(): void {
    const categories = ['technical', 'business', 'creative', 'legal', 'research'];

    for (const category of categories) {
      const categoryPath = join(this.capabilitiesPath, category);

      if (!existsSync(categoryPath)) {
        continue;
      }

      const files = readdirSync(categoryPath);

      for (const file of files) {
        if (file.endsWith('.md')) {
          const capabilityName = file.replace('.md', '');
          const filePath = join(categoryPath, file);
          const capability = this.parseCapabilityFile(filePath, capabilityName, category);

          if (capability) {
            this.capabilities.set(capabilityName, capability);
          }
        }
      }
    }

    console.log(`Loaded ${this.capabilities.size} capabilities`);
  }

  /**
   * Parse a capability markdown file
   */
  private parseCapabilityFile(
    filePath: string,
    name: string,
    category: string
  ): CapabilityDefinition | null {
    try {
      const content = readFileSync(filePath, 'utf-8');

      const capability: CapabilityDefinition = {
        name,
        category: category as any,
        domainKnowledge: this.extractSection(content, 'Domain Knowledge'),
        thinkingPatterns: this.extractSection(content, 'Thinking Patterns'),
        outputFormats: this.extractSection(content, 'Output Formats'),
        requiredContext: this.extractSection(content, 'Required Context'),
        collaboration: this.extractCollaboration(content)
      };

      return capability;
    } catch (error) {
      console.error(`Error parsing capability file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extract a section from markdown content
   */
  private extractSection(content: string, sectionName: string): string[] {
    const items: string[] = [];
    const sectionRegex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = content.match(sectionRegex);

    if (match) {
      const sectionContent = match[1];
      const bulletPoints = sectionContent.match(/^[-*]\s+(.+)$/gm);

      if (bulletPoints) {
        items.push(...bulletPoints.map(bp => bp.replace(/^[-*]\s+/, '').trim()));
      }
    }

    return items;
  }

  /**
   * Extract collaboration information
   */
  private extractCollaboration(content: string): { providesTo: string[]; receivesFrom: string[] } {
    const collaboration = { providesTo: [], receivesFrom: [] };

    const providesToMatch = content.match(/\*\*Provides to\*\*:?\s*\n([\s\S]*?)(?=\*\*Receives from\*\*|\n## |$)/i);
    const receivesFromMatch = content.match(/\*\*Receives from\*\*:?\s*\n([\s\S]*?)(?=\n## |$)/i);

    if (providesToMatch) {
      const items = providesToMatch[1].match(/[-*]\s+(.+?)(?:\(|$)/gm);
      if (items) {
        collaboration.providesTo = items.map(item =>
          item.replace(/^[-*]\s+/, '').split('(')[0].trim()
        );
      }
    }

    if (receivesFromMatch) {
      const items = receivesFromMatch[1].match(/[-*]\s+(.+?)(?:\(|$)/gm);
      if (items) {
        collaboration.receivesFrom = items.map(item =>
          item.replace(/^[-*]\s+/, '').split('(')[0].trim()
        );
      }
    }

    return collaboration;
  }

  /**
   * Match project analysis to capabilities and create agent assignments
   */
  public matchCapabilities(analysis: ProjectAnalysis): {
    assignments: AgentAssignment[];
    gaps: string[];
    recommendations: string[];
  } {
    const assignments: AgentAssignment[] = [];
    const gaps: string[] = [];
    const recommendations: string[] = [];

    // Get unique capabilities from requirements
    const requiredCapabilities = new Set(analysis.requiredCapabilities);

    // Check which capabilities we have
    const availableCapabilities = new Set<string>();
    const missingCapabilities = new Set<string>();

    for (const requiredCap of requiredCapabilities) {
      if (this.capabilities.has(requiredCap)) {
        availableCapabilities.add(requiredCap);
      } else {
        missingCapabilities.add(requiredCap);
        gaps.push(`Missing capability: ${requiredCap}`);
      }
    }

    // Group capabilities into logical agents
    const agentGroups = this.groupCapabilitiesIntoAgents(
      Array.from(availableCapabilities),
      analysis.suggestedPhases
    );

    // Create agent assignments
    let agentId = 1;
    for (const group of agentGroups) {
      const assignment: AgentAssignment = {
        agentId: `agent-${agentId.toString().padStart(2, '0')}`,
        capabilities: group.capabilities,
        phase: group.phase,
        context: this.generateAgentContext(group.capabilities, analysis),
        status: 'pending'
      };

      assignments.push(assignment);
      agentId++;
    }

    // Generate recommendations
    if (missingCapabilities.size > 0) {
      recommendations.push(
        `Consider adding these capabilities to the library: ${Array.from(missingCapabilities).join(', ')}`
      );
    }

    // Recommend additional capabilities based on project type
    const suggested = this.suggestAdditionalCapabilities(analysis, availableCapabilities);
    if (suggested.length > 0) {
      recommendations.push(...suggested);
    }

    return { assignments, gaps, recommendations };
  }

  /**
   * Group capabilities into logical agent roles
   */
  private groupCapabilitiesIntoAgents(
    capabilities: string[],
    phases: string[]
  ): Array<{ capabilities: string[]; phase: string }> {
    const groups: Array<{ capabilities: string[]; phase: string }> = [];

    // Business-focused agent (conception phase)
    const businessCaps = capabilities.filter(cap =>
      ['business-modeling', 'mvp-planning', 'pricing-strategy', 'market-analysis'].includes(cap)
    );
    if (businessCaps.length > 0) {
      groups.push({
        capabilities: businessCaps,
        phase: 'conception'
      });
    }

    // Technical architecture agent (design phase)
    const architectureCaps = capabilities.filter(cap =>
      ['system-architecture', 'database-design', 'api-design'].includes(cap)
    );
    if (architectureCaps.length > 0) {
      groups.push({
        capabilities: architectureCaps,
        phase: phases.includes('technical-design') ? 'technical-design' : 'conception'
      });
    }

    // UX/Design agent (design phase)
    const designCaps = capabilities.filter(cap =>
      ['ux-design', 'responsive-design', 'mobile-optimization'].includes(cap)
    );
    if (designCaps.length > 0) {
      groups.push({
        capabilities: designCaps,
        phase: phases.includes('technical-design') ? 'technical-design' : 'conception'
      });
    }

    // Development agent (development phase)
    const devCaps = capabilities.filter(cap =>
      ['frontend-development', 'backend-development'].includes(cap)
    );
    if (devCaps.length > 0) {
      groups.push({
        capabilities: devCaps,
        phase: phases.includes('development') ? 'development' : 'all'
      });
    }

    // Compliance agent (all phases)
    const complianceCaps = capabilities.filter(cap =>
      ['gdpr-compliance', 'legal-review', 'data-protection'].includes(cap)
    );
    if (complianceCaps.length > 0) {
      groups.push({
        capabilities: complianceCaps,
        phase: 'all'
      });
    }

    // Remaining capabilities
    const assignedCaps = new Set(groups.flatMap(g => g.capabilities));
    const remainingCaps = capabilities.filter(cap => !assignedCaps.has(cap));

    if (remainingCaps.length > 0) {
      groups.push({
        capabilities: remainingCaps,
        phase: 'all'
      });
    }

    return groups;
  }

  /**
   * Generate context string for an agent
   */
  private generateAgentContext(capabilities: string[], analysis: ProjectAnalysis): string {
    const contexts: string[] = [];

    // Add project type context
    contexts.push(analysis.projectType);

    // Add domain context
    if (analysis.domains.length > 0) {
      contexts.push(analysis.domains.join('/'));
    }

    // Add complexity context
    contexts.push(`${analysis.complexity} complexity`);

    // Add capability-specific context
    if (capabilities.some(c => c.includes('business'))) {
      contexts.push('MVP focus, bootstrap budget');
    }

    if (capabilities.includes('gdpr-compliance')) {
      contexts.push('German law, customer data protection');
    }

    if (capabilities.includes('ux-design')) {
      contexts.push('Simple UI for non-technical users');
    }

    return contexts.join(', ');
  }

  /**
   * Suggest additional capabilities that might be valuable
   */
  private suggestAdditionalCapabilities(
    analysis: ProjectAnalysis,
    currentCapabilities: Set<string>
  ): string[] {
    const suggestions: string[] = [];

    // For SaaS projects
    if (analysis.projectType.includes('saas')) {
      if (!currentCapabilities.has('pricing-strategy')) {
        suggestions.push('Consider adding pricing-strategy capability for SaaS monetization');
      }
      if (!currentCapabilities.has('market-analysis')) {
        suggestions.push('Consider adding market-analysis capability for SaaS positioning');
      }
    }

    // For high complexity projects
    if (analysis.complexity === 'high') {
      if (!currentCapabilities.has('devops')) {
        suggestions.push('Consider adding devops capability for deployment and scaling');
      }
    }

    // For projects with compliance needs
    if (analysis.domains.includes('legal-compliance')) {
      if (!currentCapabilities.has('gdpr-compliance')) {
        suggestions.push('GDPR compliance capability is critical for this project');
      }
    }

    return suggestions;
  }

  /**
   * Get all available capabilities
   */
  public getAvailableCapabilities(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Get a specific capability definition
   */
  public getCapability(name: string): CapabilityDefinition | undefined {
    return this.capabilities.get(name);
  }
}
