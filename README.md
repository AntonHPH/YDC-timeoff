# Hutchison Ports E-Leave Management System

This repository contains a first production-style baseline for an enterprise e-leave platform, aligned to Hutchison Ports requirements.

## What is included

- React + TypeScript + MUI + FullCalendar frontend (`frontend/`)
- .NET 8 Web API backend with layered architecture (`backend/`)
- SQL Server-ready database schema (`database/schema.sql`)
- Architecture and design documentation (`docs/`)
- Export framework abstraction for PDF/Excel/CSV
- RBAC-ready security model and AD/Entra ID integration points

## Folder structure

```text
hutchison-eleave/
  backend/
    src/
      Hutchison.Leave.Api/
      Hutchison.Leave.Application/
      Hutchison.Leave.Domain/
      Hutchison.Leave.Infrastructure/
    tests/
      Hutchison.Leave.SmokeTest/
  frontend/
    src/
      components/
      pages/
      services/
  database/
    schema.sql
  docs/
    ux-wireframes.md
    erd.md
    api-structure.md
    security-model.md
```

## Architecture highlights

- Layered architecture: API -> Application -> Domain -> Infrastructure
- Repository pattern in Infrastructure with in-memory seed implementation
- Service layer for business rules (leave duration, validation, conflict checks)
- Dependency injection via extension methods
- SQL Server migration path documented in `docs/api-structure.md`

## Quick start

### 0) Start both services (Windows)

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave"
.\start-dev.bat
```

This launches backend and frontend in separate command windows.
If `dotnet` is not installed system-wide, the script auto-installs a local SDK to `.dotnet/` in the repo (no admin required).
If you only want to test frontend startup via the script, run `./start-dev.bat --frontend-only`.

### 1) Backend

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave\backend"
dotnet run --project .\src\Hutchison.Leave.Api\Hutchison.Leave.Api.csproj
```

API base URL: `http://localhost:5182`

### 2) Frontend

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave\frontend"
npm install
npm run dev
```

UI URL (default): `http://localhost:5173`

## Smoke test

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave\backend"
dotnet run --project .\tests\Hutchison.Leave.SmokeTest\Hutchison.Leave.SmokeTest.csproj
```

Expected output includes:

- Working day calculation
- Balance check
- PASS result line

## Next implementation steps

1. Replace in-memory repositories with EF Core SQL Server repositories.
2. Add Microsoft Entra ID authentication and role claims mapping.
3. Add real PDF/Excel engines (QuestPDF + ClosedXML).
4. Add integration adapters for HRMS export and payroll sync.
5. Add automated tests (unit + API integration + frontend component tests).
