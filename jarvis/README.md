# Jarvis

An intelligent, domain-agnostic multi-agent orchestration system that dynamically assigns specialized agents based on project needs.

## Overview

This system creates specialized AI agents based on project requirements rather than predefined roles. It analyzes project documents, identifies needed capabilities, and assembles the optimal agent team.

## Key Features

- **Domain-Agnostic**: Works for software, business, creative, or analytical projects
- **Dynamic Agent Assignment**: Agents are created based on project needs, not fixed roles
- **Skill-Based Pool**: Agents defined by capabilities (business modeling, architecture, UX, etc.)
- **Project-Driven**: Agents configure themselves based on project context
- **Extensible**: Add new capabilities by creating markdown files

## Architecture

```
jarvis/
├── agent-pool/           # Capability definitions
│   ├── capabilities/
│   │   ├── technical/    # Technical capabilities
│   │   ├── business/     # Business capabilities
│   │   ├── creative/     # Creative capabilities
│   │   ├── legal/        # Legal capabilities
│   │   └── research/     # Research capabilities
│   └── agent-templates/
├── orchestrator/         # Core system logic
│   ├── project-analyzer.ts    # Analyzes project documents
│   ├── capability-matcher.ts  # Matches capabilities to needs
│   ├── agent-factory.ts       # Creates specialized agents
│   ├── workflow-engine.ts     # Manages execution flow
│   ├── context-manager.ts     # Shared knowledge base
│   └── cli.ts                 # Command-line interface
├── projects/            # Active and archived projects
│   ├── active/
│   └── archived/
└── shared/              # Shared utilities and types
```

## Installation

```bash
cd jarvis
npm install
npm run build
```

## Usage

### 1. Analyze a Project Document

```bash
npm run analyze ../projectidea.md
```

This analyzes a project document and extracts:
- Project type and domains
- Required capabilities
- Complexity assessment
- Suggested phases
- Requirements and priorities
- Potential risks

### 2. Create a New Project

```bash
npm run create-project ../projectidea.md "Heizungsbauer Platform"
```

This creates a complete project setup:
- Analyzes the project document
- Matches capabilities to requirements
- Creates specialized agents
- Generates agent prompts and specifications
- Creates workflow phases
- Sets up knowledge base

### 3. List Active Projects

```bash
npm run list
```

## Capabilities

### Business Capabilities
- **Business Modeling**: Value proposition, business model canvas, revenue models
- **MVP Planning**: Feature prioritization, scope definition, validation metrics
- **Pricing Strategy**: SaaS pricing, value-based pricing, tier structure

### Technical Capabilities
- **System Architecture**: Software architecture, tech stack selection, scalability
- **Database Design**: Schema design, multi-tenancy, optimization
- **Frontend Development**: React/Vue/Svelte, responsive design, state management
- **Backend Development**: API design, authentication, background jobs

### Legal Capabilities
- **GDPR Compliance**: Privacy policies, consent management, data protection

### Creative Capabilities
- **UX Design**: User research, wireframing, usability, accessibility

## Project Structure

Each created project contains:

```
project-name/
├── project-config.json        # Project configuration
├── project-analysis.json      # Analysis results
├── workflow.json              # Execution workflow
├── agent-assignments.json     # Agent team composition
├── agents/                    # Individual agent specifications
│   ├── agent-01-business-strategy-agent.md
│   ├── agent-02-technical-architecture-agent.md
│   └── ...
├── context/                   # Shared knowledge base
└── outputs/                   # Agent outputs and artifacts
```

## Adding New Capabilities

1. Create a new markdown file in the appropriate category folder:
   ```
   agent-pool/capabilities/technical/new-capability.md
   ```

2. Define the capability structure:
   ```markdown
   # Capability Name

   ## Domain Knowledge
   - Knowledge area 1
   - Knowledge area 2

   ## Thinking Patterns
   - How to approach problems

   ## Output Formats
   - What this capability produces

   ## Required Context
   - Information needed

   ## Collaboration
   - **Provides to**: Other capabilities
   - **Receives from**: Input sources
   ```

3. The system automatically discovers and loads new capabilities

## Workflow Patterns

### Sequential Refinement
```
User Input → Analyzer → Conception Agents → Review → Technical Agents → Implementation
```

### Parallel Workstreams
```
Project Brief → [Technical Track | Business Track | Compliance Track] → Integration → Output
```

### Iterative Deepening
```
High-level Analysis → Identify Gaps → Specialists → Synthesis → Validation Loop
```

## Example: Heizungsbauer SaaS Project

The system was designed to handle the "Heizungsbauer-Wartungsplattform" project:

1. **Analyzes** the project document (German heating technician maintenance platform)
2. **Identifies** domains: software development, business conception, legal compliance, marketing
3. **Creates** specialized agents:
   - Business Strategy Agent (MVP, market analysis)
   - Technical Architecture Agent (system design, database)
   - UX Design Agent (simple UI for non-technical users)
   - Compliance Agent (GDPR, email consent)
   - Pricing Agent (SaaS pricing model)
4. **Generates** phase-based workflow (conception → design → development → validation)

## Benefits

- **Reusability**: Same system works for any project type
- **Flexibility**: Agents adapt to project context
- **Scalability**: Add capabilities without code changes
- **Consistency**: Structured approach across projects
- **Learning**: System improves from completed projects

## Next Steps

1. Review generated agent specifications
2. Execute conception phase with business agents
3. Gather outputs in the context folder
4. Progress through workflow phases
5. Document learnings for future projects

## License

MIT
