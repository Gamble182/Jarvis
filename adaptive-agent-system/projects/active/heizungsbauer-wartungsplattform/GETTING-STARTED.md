# Heizungsbauer Wartungsplattform - Getting Started

## Project Overview

This is a SaaS application for heating technicians (Heizungsbauer) to manage customer maintenance, automate reminders, and organize appointments.

**Target User:** Max, a one-person heating technician operation
**Goal:** Digitalize organizational processes without hiring additional staff
**Long-term Vision:** Scale as a multi-tenant SaaS for other craftsmen

## Generated Agent Team

The system has automatically created 3 specialized agents for this project:

### 1. Business Strategy Agent (`agent-01`)
**Capabilities:** Business Modeling, MVP Planning, Pricing Strategy
**Phase:** Conception
**Focus:**
- Define the business model and value proposition
- Plan the MVP scope and features
- Design the pricing strategy for SaaS model
- Identify target customer segments
- Create go/no-go recommendations

### 2. Technical Architecture Agent (`agent-02`)
**Capabilities:** System Architecture
**Phase:** Technical Design
**Focus:**
- Design the overall system architecture
- Select the technology stack
- Plan database architecture
- Define API structure
- Ensure scalability for multi-tenant future

### 3. Compliance & Legal Agent (`agent-03`)
**Capabilities:** GDPR Compliance
**Phase:** All phases
**Focus:**
- Ensure GDPR compliance for customer data
- Design consent mechanisms for automated emails
- Create data processing agreements (AV-Vertrag)
- Define data retention policies
- Handle privacy policy and legal requirements

## Project Phases

The system suggests the following execution phases:

1. **Conception** - Business model, MVP definition, compliance framework
2. **MVP Planning** - Feature prioritization, user stories, scope definition
3. **Technical Design** - Architecture, database design, API design
4. **Development** - Implementation of MVP features
5. **Launch Preparation** - Testing, deployment, documentation

## Extracted Key Requirements

### Must-Have Features (MVP)
- Customer management (name, address, contact, equipment details)
- Automated maintenance interval calculation
- Automated email reminders to customers
- Parts/materials management per customer
- Basic appointment scheduling
- Mobile-optimized interface

### High Priority Features
- Maintenance history tracking
- Calendar integration (iCal/Google/Outlook)
- Inventory management
- Multi-tenant capability (for SaaS)

### Identified Risks
- Calendar integration complexity (timezones, availability management)
- Email deliverability and spam filter challenges
- Multi-tenancy architecture complexity and data isolation
- UI must be extremely simple for non-technical users
- GDPR compliance requirements for customer data handling
- SaaS requirements: billing system, customer support, monitoring

## Next Steps

### 1. Execute Conception Phase

Work with the **Business Strategy Agent** to:
- Create a business model canvas
- Define the value proposition for heating technicians
- Identify MVP features vs. nice-to-have features
- Design pricing model (per-business subscription)
- Assess market opportunity

**Output Location:** `outputs/conception/`

### 2. Compliance Foundation

Work with the **Compliance & Legal Agent** to:
- Define GDPR-compliant data handling processes
- Design email consent flow
- Create privacy policy framework
- Define data retention rules

**Output Location:** `outputs/compliance/`

### 3. Technical Design

Work with the **Technical Architecture Agent** to:
- Choose technology stack (React/Vue, Node.js/Python, PostgreSQL)
- Design multi-tenant architecture
- Plan database schema
- Define API structure
- Choose email service (SendGrid, Mailgun, etc.)

**Output Location:** `outputs/technical-design/`

### 4. Iterate and Refine

- Review outputs from all agents
- Identify gaps and inconsistencies
- Refine plans based on agent feedback
- Proceed to development phase

## Using the Context Manager

The context manager stores and shares knowledge between agents. Use it to:

```typescript
import { ContextManager } from '../../../orchestrator/context-manager.js';

const contextManager = new ContextManager('./');

// Store agent output
contextManager.storeArtifact(
  'business-model',
  'MVP Feature List',
  { features: [...] },
  'agent-01',
  ['mvp', 'features']
);

// Retrieve for next agent
const mvpFeatures = contextManager.getArtifactsByTag('mvp');
```

## Project Configuration

See `project-config.json` for:
- Complete list of required capabilities
- Project domains
- Execution phases
- Constraints (complexity, budget)

## Workflow

See `workflow.json` for:
- Sequential execution steps
- Dependencies between agents
- Phase transitions

## Agent Specifications

See `agents/` folder for detailed agent prompts with:
- Domain knowledge
- Thinking patterns
- Expected outputs
- Collaboration interfaces

---

**Status:** Conception Phase Ready
**Next Action:** Execute Business Strategy Agent for MVP definition
