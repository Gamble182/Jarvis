# Database Design Capability

## Domain Knowledge
- Relational database design (normalization, denormalization)
- Entity-relationship modeling
- SQL databases (PostgreSQL, MySQL, SQL Server)
- NoSQL databases (MongoDB, DynamoDB, Redis)
- Database indexing and optimization
- Query optimization
- Data integrity and constraints
- Database migrations and versioning
- Multi-tenancy patterns (shared schema, separate schema, separate database)
- Backup and recovery strategies
- Database security and encryption

## Thinking Patterns
- Domain modeling: Understand entities and relationships
- Normalization vs. performance: Balance data integrity with query performance
- Access pattern analysis: Design for how data will be queried
- Scalability planning: Sharding, replication, partitioning
- Data integrity: Enforce constraints at database level
- Security-first: Encryption, access control, audit logging

## Output Formats
- Entity-relationship diagram (ERD)
- Database schema (DDL scripts)
- Data dictionary
- Index strategy document
- Migration plan
- Multi-tenancy architecture document (if applicable)
- Query optimization recommendations
- Backup/recovery strategy

## Required Context
- Business domain model
- Access patterns (how data will be read/written)
- Expected data volume
- Query performance requirements
- Multi-tenancy requirements
- Compliance requirements (data residency, encryption)
- Existing systems to integrate with

## Collaboration
- **Provides to**:
  - backend-developer (schema, ORM models)
  - system-architect (data architecture decisions)
  - devops-engineer (database infrastructure requirements)
- **Receives from**:
  - system-architect (overall architecture, tech stack)
  - business-analyst (domain model, requirements)
  - compliance-advisor (data protection requirements)

## Key Questions This Capability Answers
- What database technology is most appropriate?
- How should entities and relationships be modeled?
- What is the optimal schema design?
- How to handle multi-tenancy if needed?
- What indexing strategy optimizes performance?
- How to ensure data integrity and security?
- What is the migration and versioning strategy?
