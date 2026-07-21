# Backend Architecture Details

## Projects and responsibilities

- `Hutchison.Leave.Api`
  - REST endpoints
  - request/response contracts
  - CORS and API hosting concerns
- `Hutchison.Leave.Application`
  - service layer use cases
  - leave calculation logic
  - report generation orchestration
- `Hutchison.Leave.Domain`
  - business entities and enums
- `Hutchison.Leave.Infrastructure`
  - repository implementations
  - seed data and data source abstraction

## Patterns used

- Layered architecture
- Repository pattern
- Service layer
- Dependency injection (`AddApplicationServices`, `AddInfrastructureServices`)

## Business rule examples

- Leave duration calculation excludes weekends and holidays
- Session handling supports full-day and half-day requests
- Approval updates leave balance atomically in service flow

## Evolution path to production

1. Replace in-memory repositories with EF Core SQL Server implementations.
2. Add Entra ID authentication and authorization policies.
3. Add outbox/event publishing for HRMS integration.
4. Add structured logging, metrics, and distributed tracing.
5. Add integration tests and contract tests.

