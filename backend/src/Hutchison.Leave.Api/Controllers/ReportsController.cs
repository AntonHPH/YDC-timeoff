using Hutchison.Leave.Application;
using Microsoft.AspNetCore.Mvc;

namespace Hutchison.Leave.Api.Controllers;

[ApiController]
[Route("api/reports")]
public sealed class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly IExportService _exportService;

    public ReportsController(IReportService reportService, IExportService exportService)
    {
        _reportService = reportService;
        _exportService = exportService;
    }

    [HttpGet("leave-balance")]
    public async Task<ActionResult<IReadOnlyList<LeaveBalanceRowDto>>> GetLeaveBalance(CancellationToken ct)
    {
        var rows = await _reportService.GetLeaveBalanceAsync(ct);
        return Ok(rows);
    }

    [HttpGet("leave-transaction")]
    public async Task<ActionResult<IReadOnlyList<LeaveTransactionRowDto>>> GetLeaveTransaction(CancellationToken ct)
    {
        var rows = await _reportService.GetLeaveTransactionsAsync(ct);
        return Ok(rows);
    }

    [HttpGet("export")]
    public async Task<ActionResult> Export([FromQuery] string report, [FromQuery] string format = "csv", CancellationToken ct = default)
    {
        if (string.Equals(report, "leave-balance", StringComparison.OrdinalIgnoreCase))
        {
            var rows = await _reportService.GetLeaveBalanceAsync(ct);
            var file = _exportService.ExportLeaveBalance(rows, format);
            var ext = _exportService.GetFileExtension(format);
            var type = _exportService.GetContentType(format);
            return File(file, type, $"leave-balance-report.{ext}");
        }

        if (string.Equals(report, "leave-transaction", StringComparison.OrdinalIgnoreCase))
        {
            var rows = await _reportService.GetLeaveTransactionsAsync(ct);
            var file = _exportService.ExportLeaveTransactions(rows, format);
            var ext = _exportService.GetFileExtension(format);
            var type = _exportService.GetContentType(format);
            return File(file, type, $"leave-transaction-report.{ext}");
        }

        return BadRequest(new { message = "Unknown report. Use leave-balance or leave-transaction." });
    }
}

