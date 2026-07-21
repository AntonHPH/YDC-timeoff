# Backend

Layered .NET 8 Web API for Hutchison Ports E-Leave.

## Projects

- `src/Hutchison.Leave.Api` - HTTP API controllers
- `src/Hutchison.Leave.Application` - services and interfaces
- `src/Hutchison.Leave.Domain` - domain models and enums
- `src/Hutchison.Leave.Infrastructure` - in-memory repositories and DI
- `tests/Hutchison.Leave.SmokeTest` - executable smoke validation

## Run API

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave\backend"
dotnet run --project .\src\Hutchison.Leave.Api\Hutchison.Leave.Api.csproj
```

## Run smoke test

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave\backend"
dotnet run --project .\tests\Hutchison.Leave.SmokeTest\Hutchison.Leave.SmokeTest.csproj
```

