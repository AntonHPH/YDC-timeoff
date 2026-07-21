# Export Framework

## Supported formats in baseline

- Leave Balance Report: PDF placeholder, Excel-compatible text, CSV
- Leave Transaction Report: PDF placeholder, Excel-compatible text, CSV

## Current implementation

- `IExportService` abstraction in application layer
- `ExportService` baseline implementation in `Hutchison.Leave.Application`
- HTTP download endpoint:
  - `GET /api/reports/export?report=leave-balance&format=pdf`
  - `GET /api/reports/export?report=leave-transaction&format=excel`

## Production upgrade recommendations

- Replace placeholder PDF with QuestPDF
- Replace Excel text export with ClosedXML
- Add branded templates (logo, footer, report metadata)
- Add background generation and async download links for large exports
- Add watermark options for confidential HR reports

