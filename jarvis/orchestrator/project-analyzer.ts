import { readFileSync } from 'fs';
import { ProjectAnalysis, Requirement } from '../shared/types.js';

/**
 * ProjectAnalyzer - Analyzes project documentation and extracts requirements
 *
 * This component:
 * - Reads project documentation (markdown, text, etc.)
 * - Identifies project type and domains
 * - Extracts functional and non-functional requirements
 * - Determines complexity level
 * - Suggests required capabilities
 * - Identifies risks and constraints
 */
export class ProjectAnalyzer {
  /**
   * Analyze a project document and extract structured information
   */
  public async analyzeProject(documentPath: string): Promise<ProjectAnalysis> {
    const content = readFileSync(documentPath, 'utf-8');

    // Extract key information from the document
    const projectType = this.detectProjectType(content);
    const domains = this.extractDomains(content);
    const complexity = this.assessComplexity(content);
    const requirements = this.extractRequirements(content);
    const capabilities = this.inferRequiredCapabilities(requirements, domains);
    const phases = this.suggestPhases(projectType, requirements);
    const risks = this.identifyRisks(content, requirements);

    return {
      projectType,
      domains,
      complexity,
      requiredCapabilities: capabilities,
      suggestedPhases: phases,
      extractedRequirements: requirements,
      risks
    };
  }

  /**
   * Detect the type of project from content
   */
  private detectProjectType(content: string): string {
    const lowerContent = content.toLowerCase();

    // Check for project type indicators
    if (lowerContent.includes('saas') || lowerContent.includes('web-app') ||
        lowerContent.includes('plattform')) {
      return 'saas-application';
    }
    if (lowerContent.includes('mobile') || lowerContent.includes('app')) {
      return 'mobile-application';
    }
    if (lowerContent.includes('marketing') || lowerContent.includes('kampagne')) {
      return 'marketing-campaign';
    }
    if (lowerContent.includes('analyse') || lowerContent.includes('research')) {
      return 'research-project';
    }

    return 'general-software';
  }

  /**
   * Extract relevant domains from content
   */
  private extractDomains(content: string): string[] {
    const domains = new Set<string>();
    const lowerContent = content.toLowerCase();

    // Technical domain indicators
    if (lowerContent.match(/backend|frontend|database|api|entwicklung|development/)) {
      domains.add('software-development');
    }

    // Business domain indicators
    if (lowerContent.match(/business|geschäft|mvp|conception|planung/)) {
      domains.add('business-conception');
    }

    // Legal/Compliance domain indicators
    if (lowerContent.match(/dsgvo|gdpr|legal|compliance|datenschutz|rechtlich/)) {
      domains.add('legal-compliance');
    }

    // Marketing domain indicators
    if (lowerContent.match(/marketing|vertrieb|kunde|customer|markt/)) {
      domains.add('marketing');
    }

    // Finance domain indicators
    if (lowerContent.match(/kosten|preis|budget|finan|roi|billing/)) {
      domains.add('financial-planning');
    }

    return Array.from(domains);
  }

  /**
   * Assess project complexity
   */
  private assessComplexity(content: string): 'low' | 'medium' | 'high' {
    let complexityScore = 0;
    const lowerContent = content.toLowerCase();

    // Indicators of complexity
    if (lowerContent.includes('multi-tenant') || lowerContent.includes('mandanten')) complexityScore += 2;
    if (lowerContent.includes('automation') || lowerContent.includes('automatisiert')) complexityScore += 1;
    if (lowerContent.includes('integration') || lowerContent.includes('schnittstelle')) complexityScore += 1;
    if (lowerContent.includes('real-time') || lowerContent.includes('echtzeit')) complexityScore += 2;
    if (lowerContent.includes('compliance') || lowerContent.includes('dsgvo')) complexityScore += 1;
    if (lowerContent.includes('mobile')) complexityScore += 1;
    if (lowerContent.includes('calendar') || lowerContent.includes('kalender')) complexityScore += 1;

    // Count features/requirements
    const featureMatches = content.match(/\n\s*[-*]\s+/g);
    if (featureMatches && featureMatches.length > 15) complexityScore += 2;
    else if (featureMatches && featureMatches.length > 8) complexityScore += 1;

    if (complexityScore >= 6) return 'high';
    if (complexityScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Extract requirements from content
   */
  private extractRequirements(content: string): Requirement[] {
    const requirements: Requirement[] = [];
    const lines = content.split('\n');

    let currentSection = '';
    let reqId = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Track sections
      if (line.match(/^#{1,3}\s+/)) {
        currentSection = line.replace(/^#+\s+/, '');
        continue;
      }

      // Extract bullet points as potential requirements
      const bulletMatch = line.match(/^[-*]\s+(.+)/);
      if (bulletMatch) {
        const description = bulletMatch[1];
        const priority = this.determinePriority(description, currentSection);
        const category = this.categorizeRequirement(description, currentSection);

        requirements.push({
          id: `REQ-${reqId.toString().padStart(3, '0')}`,
          category,
          description,
          priority,
          relatedCapabilities: []
        });
        reqId++;
      }
    }

    // Map capabilities to requirements
    requirements.forEach(req => {
      req.relatedCapabilities = this.mapCapabilitiesToRequirement(req);
    });

    return requirements;
  }

  /**
   * Determine priority of a requirement
   */
  private determinePriority(description: string, section: string): 'must-have' | 'should-have' | 'nice-to-have' {
    const lowerDesc = description.toLowerCase();
    const lowerSection = section.toLowerCase();

    // MVP or core features are must-have
    if (lowerSection.includes('mvp') || lowerSection.includes('core') || lowerSection.includes('kern')) {
      return 'must-have';
    }

    // Extensions are nice-to-have
    if (lowerSection.includes('erweiterung') || lowerSection.includes('extension') ||
        lowerSection.includes('später') || lowerSection.includes('optional')) {
      return 'nice-to-have';
    }

    // Critical features
    if (lowerDesc.match(/must|muss|kritisch|essential|notwendig/)) {
      return 'must-have';
    }

    // Optional features
    if (lowerDesc.match(/optional|nice|wünschenswert|später/)) {
      return 'nice-to-have';
    }

    return 'should-have';
  }

  /**
   * Categorize a requirement
   */
  private categorizeRequirement(description: string, section: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.match(/datenbank|database|daten|speicher/)) return 'data-management';
    if (lowerDesc.match(/ui|interface|design|benutzer/)) return 'user-interface';
    if (lowerDesc.match(/api|schnittstelle|integration/)) return 'integration';
    if (lowerDesc.match(/email|mail|benachrichtigung|notification/)) return 'communication';
    if (lowerDesc.match(/auth|login|zugriff|berechtigung/)) return 'authentication';
    if (lowerDesc.match(/termin|kalender|calendar|scheduling/)) return 'scheduling';
    if (lowerDesc.match(/material|ersatzteil|inventory|bestand/)) return 'inventory';
    if (lowerDesc.match(/automatisch|automatic|automation/)) return 'automation';
    if (lowerDesc.match(/dsgvo|gdpr|datenschutz|compliance/)) return 'compliance';
    if (lowerDesc.match(/mobile|responsive/)) return 'mobile';

    return 'general';
  }

  /**
   * Map capabilities to a requirement
   */
  private mapCapabilitiesToRequirement(req: Requirement): string[] {
    const capabilities = new Set<string>();

    switch (req.category) {
      case 'data-management':
        capabilities.add('database-design');
        break;
      case 'user-interface':
        capabilities.add('ux-design');
        capabilities.add('frontend-development');
        break;
      case 'integration':
        capabilities.add('api-design');
        capabilities.add('system-integration');
        break;
      case 'communication':
        capabilities.add('email-automation');
        capabilities.add('notification-systems');
        break;
      case 'authentication':
        capabilities.add('security-architecture');
        capabilities.add('backend-development');
        break;
      case 'scheduling':
        capabilities.add('calendar-integration');
        capabilities.add('business-logic-design');
        break;
      case 'inventory':
        capabilities.add('data-modeling');
        capabilities.add('business-logic-design');
        break;
      case 'automation':
        capabilities.add('workflow-automation');
        capabilities.add('backend-development');
        break;
      case 'compliance':
        capabilities.add('gdpr-compliance');
        capabilities.add('legal-review');
        break;
      case 'mobile':
        capabilities.add('responsive-design');
        capabilities.add('mobile-optimization');
        break;
    }

    return Array.from(capabilities);
  }

  /**
   * Infer required capabilities from requirements and domains
   */
  private inferRequiredCapabilities(requirements: Requirement[], domains: string[]): string[] {
    const capabilities = new Set<string>();

    // Add capabilities from requirements
    requirements.forEach(req => {
      req.relatedCapabilities.forEach(cap => capabilities.add(cap));
    });

    // Add domain-specific capabilities
    domains.forEach(domain => {
      switch (domain) {
        case 'software-development':
          capabilities.add('system-architecture');
          capabilities.add('technical-design');
          break;
        case 'business-conception':
          capabilities.add('business-modeling');
          capabilities.add('mvp-planning');
          break;
        case 'legal-compliance':
          capabilities.add('gdpr-compliance');
          capabilities.add('legal-review');
          break;
        case 'marketing':
          capabilities.add('market-analysis');
          capabilities.add('go-to-market-strategy');
          break;
        case 'financial-planning':
          capabilities.add('pricing-strategy');
          capabilities.add('cost-estimation');
          break;
      }
    });

    return Array.from(capabilities);
  }

  /**
   * Suggest project phases
   */
  private suggestPhases(projectType: string, requirements: Requirement[]): string[] {
    const phases: string[] = ['conception'];

    if (projectType.includes('saas') || projectType.includes('application')) {
      phases.push('mvp-planning');
      phases.push('technical-design');
      phases.push('development');

      // Add validation phase if there are market-related requirements
      const hasMarketRequirements = requirements.some(r =>
        r.description.toLowerCase().includes('markt') ||
        r.description.toLowerCase().includes('customer')
      );
      if (hasMarketRequirements) {
        phases.push('market-validation');
      }

      phases.push('launch-preparation');
    }

    return phases;
  }

  /**
   * Identify potential risks
   */
  private identifyRisks(content: string, requirements: Requirement[]): string[] {
    const risks: string[] = [];
    const lowerContent = content.toLowerCase();

    // Technical risks
    if (lowerContent.includes('kalender') || lowerContent.includes('calendar')) {
      risks.push('Calendar integration complexity (timezones, availability management)');
    }

    if (lowerContent.includes('email') || lowerContent.includes('mail')) {
      risks.push('Email deliverability and spam filter challenges');
    }

    if (lowerContent.includes('multi-tenant') || lowerContent.includes('mandanten')) {
      risks.push('Multi-tenancy architecture complexity and data isolation');
    }

    // UI/UX risks
    if (lowerContent.match(/einfach|simpel|simple|non-technical|nicht.*technisch/)) {
      risks.push('UI must be extremely simple for non-technical users');
    }

    // Legal risks
    if (lowerContent.includes('dsgvo') || lowerContent.includes('gdpr')) {
      risks.push('GDPR compliance requirements for customer data handling');
    }

    // Scope risks
    const featureCount = requirements.length;
    if (featureCount > 20) {
      risks.push('Feature creep - scope should be limited to MVP');
    }

    // SaaS-specific risks
    if (lowerContent.includes('saas')) {
      risks.push('SaaS requirements: billing system, customer support, monitoring');
    }

    return risks;
  }
}
