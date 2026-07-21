using System.Text;

namespace Hutchison.Leave.Application.Services;

public sealed class ExportService : IExportService
{
    public byte[] ExportLeaveBalance(IReadOnlyList<LeaveBalanceRowDto> rows, string format)
    {
        var normalized = NormalizeFormat(format);
        return normalized switch
        {
            "pdf" => ToPseudoPdf(BuildBalanceText(rows)),
            "excel" => Encoding.UTF8.GetBytes(BuildBalanceCsv(rows)),
            "csv" => Encoding.UTF8.GetBytes(BuildBalanceCsv(rows)),
            _ => throw new ArgumentException("Unsupported format.")
        };
    }

    public byte[] ExportLeaveTransactions(IReadOnlyList<LeaveTransactionRowDto> rows, string format)
    {
        var normalized = NormalizeFormat(format);
        return normalized switch
        {
            "pdf" => ToPseudoPdf(BuildTransactionText(rows)),
            "excel" => Encoding.UTF8.GetBytes(BuildTransactionCsv(rows)),
            "csv" => Encoding.UTF8.GetBytes(BuildTransactionCsv(rows)),
            _ => throw new ArgumentException("Unsupported format.")
        };
    }

    public string GetContentType(string format)
    {
        return NormalizeFormat(format) switch
        {
            "pdf" => "application/pdf",
            "excel" => "application/vnd.ms-excel",
            "csv" => "text/csv",
            _ => "application/octet-stream"
        };
    }

    public string GetFileExtension(string format)
    {
        return NormalizeFormat(format) switch
        {
            "pdf" => "pdf",
            "excel" => "xls",
            "csv" => "csv",
            _ => "bin"
        };
    }

    private static string NormalizeFormat(string format)
    {
        return string.IsNullOrWhiteSpace(format) ? "csv" : format.Trim().ToLowerInvariant();
    }

    private static string BuildBalanceCsv(IReadOnlyList<LeaveBalanceRowDto> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("BusinessUnit,Department,Team,Employee,LeaveType,BalanceDays");

        foreach (var row in rows)
        {
            sb.AppendLine($"{Escape(row.BusinessUnit)},{Escape(row.Department)},{Escape(row.Team)},{Escape(row.Employee)},{Escape(row.LeaveType)},{row.BalanceDays:0.##}");
        }

        return sb.ToString();
    }

    private static string BuildTransactionCsv(IReadOnlyList<LeaveTransactionRowDto> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("ReferenceNo,Employee,Department,LeaveType,StartDate,EndDate,Status,DurationDays");

        foreach (var row in rows)
        {
            sb.AppendLine($"{Escape(row.ReferenceNo)},{Escape(row.Employee)},{Escape(row.Department)},{Escape(row.LeaveType)},{row.StartDate:yyyy-MM-dd},{row.EndDate:yyyy-MM-dd},{row.Status},{row.DurationDays:0.##}");
        }

        return sb.ToString();
    }

    private static string BuildBalanceText(IReadOnlyList<LeaveBalanceRowDto> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Leave Balance Report");
        sb.AppendLine("====================");

        foreach (var row in rows)
        {
            sb.AppendLine($"{row.Employee} | {row.Department}/{row.Team} | {row.LeaveType}: {row.BalanceDays:0.##}");
        }

        return sb.ToString();
    }

    private static string BuildTransactionText(IReadOnlyList<LeaveTransactionRowDto> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Leave Transaction Report");
        sb.AppendLine("========================");

        foreach (var row in rows)
        {
            sb.AppendLine($"{row.ReferenceNo} | {row.Employee} | {row.LeaveType} | {row.StartDate:yyyy-MM-dd} to {row.EndDate:yyyy-MM-dd} | {row.Status}");
        }

        return sb.ToString();
    }

    private static byte[] ToPseudoPdf(string text)
    {
        // Baseline placeholder export that can be replaced by QuestPDF in production.
        return Encoding.UTF8.GetBytes(text);
    }

    private static string Escape(string value)
    {
        return value.Contains(',') ? $"\"{value}\"" : value;
    }
}

