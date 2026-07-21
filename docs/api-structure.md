# API Structure and Backend Architecture

## Layered architecture

- `Hutchison.Leave.Api`: controllers, request/response contracts, API concerns
- `Hutchison.Leave.Application`: use cases, services, DTOs, interfaces
- `Hutchison.Leave.Domain`: entities, enums, domain rules
- `Hutchison.Leave.Infrastructure`: repositories, seed data, persistence adapters

## Core endpoint map

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/worklist`

### Leave applications

- `GET /api/leave-applications`
- `GET /api/leave-applications/{id}`
- `POST /api/leave-applications`
- `POST /api/leave-applications/{id}/approve`
- `POST /api/leave-applications/{id}/reject`

### Calendars

- `GET /api/calendars/team`
- `GET /api/calendars/department`

### Leave types

- `GET /api/leave-types`
- `PUT /api/leave-types/{id}`

### Reports

- `GET /api/reports/leave-balance`
- `GET /api/reports/leave-transaction`
- `GET /api/reports/export?report=leave-balance&format=pdf`

### Reporting hierarchy

- `GET /api/reporting-hierarchy/tree`
- `GET /api/reporting-hierarchy/table`
- `POST /api/reporting-hierarchy/validate`


## SQL Server migration path

1. Add EF Core packages in `Hutchison.Leave.Infrastructure`.
2. Replace in-memory repositories with `DbContext` repositories.
3. Add migrations and deployment scripts.
4. Enable transaction boundaries per API use case.
5. Enable optimistic concurrency for critical entities.

## Dependency injection

- API project uses extension methods:
  - `AddApplicationServices()`
  - `AddInfrastructureServices()`

## Authentication and authorization readiness

- Add Microsoft Entra ID JWT bearer auth in API
- Role claim mapping to internal RBAC (`Employee`, `Supervisor`, `Manager`, `HR`, `SystemAdmin`)
- Endpoint-level policy enforcement via `[Authorize(Policy = "...")]`

