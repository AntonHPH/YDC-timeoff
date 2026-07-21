# UI/UX Design and Wireframes

## Design language

- Corporate, clean, modern, low cognitive load
- Primary: dark blue (`#0B3D91`)
- Secondary: light gray (`#F3F5F7`)
- Status colors:
  - Approved: green (`#2E7D32`)
  - Pending: orange (`#ED6C02`)
  - Rejected: red (`#D32F2F`)
  - Public holiday: purple (`#6A1B9A`)
  - Work from home: blue (`#1565C0`)

## Global layout

```text
+---------------------------------------------------------------+
| Header: logo | breadcrumbs | search | notifications | profile |
+----------------------+----------------------------------------+
| Left nav             | Main content                           |
| Home                 |                                        |
| E-Leave              |                                        |
|  - Apply Leave       |                                        |
|  - Team Calendar     |                                        |
|  - Department Cal    |                                        |
|  - Application Maint |                                        |
|  - Leave Type        |                                        |
|  ------------------  |                                        |
|  - Balance Report    |                                        |
|  - Txn Report        |                                        |
|  - Reporting Hier    |                                        |
| My Preferences       |                                        |
| System Settings      |                                        |
+----------------------+----------------------------------------+
```

## Home dashboard wireframe

```text
+---------------------------------------------------------------+
| Summary cards row                                               |
| [AL Balance] [Comp Leave] [Sick Leave] [Pending] [On Leave]    |
+---------------------------------------------------------------+
| Worklist table                     | Team snapshot panel        |
| - Pending applications             | - calendar shortcuts       |
| - Awaiting my approval             | - policy highlights        |
| - Upcoming leave                   | - quick links              |
| - Recent approvals                 | - notices                  |
+---------------------------------------------------------------+
```

## Apply Leave wireframe

```text
+---------------------------------------------------------------+
| Toolbar: Month/Week/Day | Legend | Search by ref/name/type      |
+-------------------------------------------+-------------------+
| FullCalendar (leave + holiday overlays)   | Leave form panel  |
|                                           | - leave type       |
|                                           | - start/end date   |
|                                           | - session          |
|                                           | - remarks          |
|                                           | - attachments      |
|                                           | [Submit] [Reset]   |
+-------------------------------------------+-------------------+
```

## Team/Department calendar wireframe

```text
+---------------------------------------------------------------+
| Filters: employee, department, leave type, date range          |
+-------------------------+-------------------------------------+
| Employee list panel     | Calendar grid                        |
| - Name                  | Hover: name/department/type/status   |
| - Position              | Color by employee or status          |
| - Current status        |                                       |
+-------------------------+-------------------------------------+
```

## Application maintenance wireframe

```text
+---------------------------------------------------------------+
| Advanced filters row (ref, applicant, dept, status, approver)  |
+---------------------------------------------------------------+
| Results table: sortable, filterable, exportable                |
| Actions: View/Edit/Cancel/Approve/Reject/Audit                 |
+---------------------------------------------------------------+
```

## Responsive behavior

- >= 1200px: fixed left nav, two-column content layouts
- 768px - 1199px: collapsible nav, stacked cards in 2 columns
- < 768px: drawer nav, cards/table stack, form full width

## Dark mode readiness

- Theme tokens centralized in `frontend/src/theme.ts`
- Status colors shared across light/dark theme variants
- User preference persisted in profile settings

