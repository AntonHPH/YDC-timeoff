# Frontend

React + TypeScript + MUI + FullCalendar client for Hutchison Ports E-Leave.

## Run

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave\frontend"
npm install
npm run dev
```

## Build

```powershell
Set-Location "C:\Users\91085\PycharmProjects\PythonProject\hutchison-eleave\frontend"
npm run build
```

## API base URL

Set `VITE_API_BASE_URL` if backend URL is different from `http://localhost:5182`.

## Offline fallback mode

If the backend API is unreachable, the frontend now automatically falls back to local seed data in `src/services/api.ts`.

This allows all pages to keep loading (dashboard, calendars, maintenance, reports, preferences) without showing `Unable to load data`.

## Simple auth mode

A localStorage-based login/register flow is available.

- Login URL: `/login`
- Register URL: `/register`
- Seed account:
  - Email: `admin@hutchisonports.com`
  - Password: `Password123!`

Users created from Register are stored in browser localStorage for this demo environment.
