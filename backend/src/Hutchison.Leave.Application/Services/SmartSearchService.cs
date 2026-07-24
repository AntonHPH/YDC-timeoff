using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Application.Services;

public sealed class SmartSearchService : ISmartSearchService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveApplicationRepository _leaveApplicationRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public SmartSearchService(
        IEmployeeRepository employeeRepository,
        ILeaveApplicationRepository leaveApplicationRepository,
        ILeaveTypeRepository leaveTypeRepository)
    {
        _employeeRepository = employeeRepository;
        _leaveApplicationRepository = leaveApplicationRepository;
        _leaveTypeRepository = leaveTypeRepository;
    }

    public async Task<SmartSearchResponseDto> SearchAsync(string query, int limit = 10, CancellationToken ct = default)
    {
        var normalizedQuery = (query ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(normalizedQuery))
        {
            return new SmartSearchResponseDto(string.Empty, 0, []);
        }

        var cappedLimit = Math.Clamp(limit, 1, 50);

        var employeesTask = _employeeRepository.GetAllAsync(ct);
        var leaveApplicationsTask = _leaveApplicationRepository.GetAllAsync(ct);
        var leaveTypesTask = _leaveTypeRepository.GetAllAsync(ct);

        await Task.WhenAll(employeesTask, leaveApplicationsTask, leaveTypesTask);

        var employees = employeesTask.Result;
        var leaveApplications = leaveApplicationsTask.Result;
        var leaveTypes = leaveTypesTask.Result;

        var employeeMap = employees.ToDictionary(x => x.Id, x => x.DisplayName);
        var leaveTypeMap = leaveTypes.ToDictionary(x => x.Id, x => x.NameEn);

        var candidates = new List<(int score, SmartSearchResultItemDto item)>();

        foreach (var employee in employees)
        {
            var score = ComputeScore(normalizedQuery,
            [
                employee.DisplayName,
                employee.EmployeeNo,
                employee.Email,
                employee.BusinessUnit,
                employee.Department,
                employee.Team
            ]);

            if (score > 0)
            {
                candidates.Add((score, new SmartSearchResultItemDto(
                    "Employee",
                    employee.Id,
                    employee.DisplayName,
                    $"{employee.EmployeeNo} • {employee.Department} • {employee.Team}",
                    "/system-settings/user-maintenance",
                    employee.IsActive ? "Active" : "Inactive",
                    null)));
            }
        }

        foreach (var leaveType in leaveTypes)
        {
            var score = ComputeScore(normalizedQuery,
            [
                leaveType.Code,
                leaveType.NameEn,
                leaveType.NameTc,
                leaveType.NameSc
            ]);

            if (score > 0)
            {
                candidates.Add((score, new SmartSearchResultItemDto(
                    "LeaveType",
                    leaveType.Id,
                    leaveType.NameEn,
                    $"{leaveType.Code} • {(leaveType.IsActive ? "Active" : "Inactive")}",
                    "/e-leave/leave-type",
                    leaveType.Code,
                    null)));
            }
        }

        foreach (var application in leaveApplications)
        {
            employeeMap.TryGetValue(application.ApplicantId, out var applicantName);
            leaveTypeMap.TryGetValue(application.LeaveTypeId, out var leaveTypeName);

            var score = ComputeScore(normalizedQuery,
            [
                application.ReferenceNo,
                applicantName,
                leaveTypeName,
                application.Remarks,
                application.Status.ToString(),
                application.StartDate.ToString("yyyy-MM-dd"),
                application.EndDate.ToString("yyyy-MM-dd")
            ]);

            if (score > 0)
            {
                candidates.Add((score, new SmartSearchResultItemDto(
                    "LeaveApplication",
                    application.Id,
                    application.ReferenceNo,
                    $"{applicantName ?? "Unknown"} • {leaveTypeName ?? "Unknown"} • {application.Status}",
                    "/e-leave/application-maintenance",
                    application.Status.ToString(),
                    application.CreatedUtc)));
            }
        }

        var items = candidates
            .OrderByDescending(x => x.score)
            .ThenByDescending(x => x.item.SortDateUtc ?? DateTime.MinValue)
            .Select(x => x.item)
            .Take(cappedLimit)
            .ToList();

        return new SmartSearchResponseDto(normalizedQuery, items.Count, items);
    }

    private static int ComputeScore(string query, IEnumerable<string?> haystacks)
    {
        var bestScore = 0;

        foreach (var value in haystacks)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            if (value.StartsWith(query, StringComparison.OrdinalIgnoreCase))
            {
                bestScore = Math.Max(bestScore, 3);
                continue;
            }

            if (value.Contains(query, StringComparison.OrdinalIgnoreCase))
            {
                bestScore = Math.Max(bestScore, 2);
            }
        }

        return bestScore;
    }
}

