using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Application.Services;

public sealed class LeaveApplicationService : ILeaveApplicationService
{
    private readonly ILeaveApplicationRepository _applicationRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;
    private readonly ILeaveCalculationService _leaveCalculationService;
    private readonly ILeaveApplicationAuditRepository _auditRepository;

    public LeaveApplicationService(
        ILeaveApplicationRepository applicationRepository,
        IEmployeeRepository employeeRepository,
        ILeaveTypeRepository leaveTypeRepository,
        ILeaveBalanceRepository leaveBalanceRepository,
        ILeaveCalculationService leaveCalculationService,
        ILeaveApplicationAuditRepository auditRepository)
    {
        _applicationRepository = applicationRepository;
        _employeeRepository = employeeRepository;
        _leaveTypeRepository = leaveTypeRepository;
        _leaveBalanceRepository = leaveBalanceRepository;
        _leaveCalculationService = leaveCalculationService;
        _auditRepository = auditRepository;
    }

    public async Task<IReadOnlyList<LeaveApplicationDto>> GetAllAsync(CancellationToken ct = default)
    {
        var applications = await _applicationRepository.GetAllAsync(ct);
        var employees = await _employeeRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);

        var employeeMap = employees.ToDictionary(e => e.Id, e => e.DisplayName);
        var leaveTypeMap = leaveTypes.ToDictionary(t => t.Id, t => t.NameEn);

        return applications
            .OrderByDescending(x => x.CreatedUtc)
            .Select(x => ToDto(x, employeeMap, leaveTypeMap))
            .ToList();
    }

    public async Task<LeaveApplicationDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var application = await _applicationRepository.GetByIdAsync(id, ct);
        if (application is null)
        {
            return null;
        }

        var employees = await _employeeRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);
        var employeeMap = employees.ToDictionary(e => e.Id, e => e.DisplayName);
        var leaveTypeMap = leaveTypes.ToDictionary(t => t.Id, t => t.NameEn);

        return ToDto(application, employeeMap, leaveTypeMap);
    }

    public async Task<LeaveApplicationDto> CreateAsync(LeaveApplicationCreateRequest request, CancellationToken ct = default)
    {
        var calc = await _leaveCalculationService.CalculateAsync(
            new LeaveCalculationRequest(
                request.StartDate,
                request.EndDate,
                request.Session,
                request.ApplicantId,
                request.LeaveTypeId),
            ct);

        if (calc.WorkingDays <= 0)
        {
            throw new InvalidOperationException("No working days selected for leave application.");
        }

        if (!calc.BalanceSufficient)
        {
            throw new InvalidOperationException("Insufficient leave balance for this application.");
        }

        var referenceNo = $"REF{DateTime.UtcNow:yyyyMM}{Random.Shared.Next(10000, 99999)}";

        var entity = new LeaveApplication
        {
            ReferenceNo = referenceNo,
            ApplicantId = request.ApplicantId,
            LeaveTypeId = request.LeaveTypeId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Session = request.Session,
            DurationDays = calc.WorkingDays,
            Remarks = request.Remarks,
            Status = LeaveStatus.Pending
        };

        await _applicationRepository.AddAsync(entity, ct);

        var employee = await _employeeRepository.GetByIdAsync(entity.ApplicantId, ct);
        var leaveType = await _leaveTypeRepository.GetByIdAsync(entity.LeaveTypeId, ct);

        await AddAuditAsync(
            entity.Id,
            action: "Created",
            actorId: entity.ApplicantId,
            actorName: employee?.DisplayName ?? "Unknown",
            comment: entity.Remarks,
            ct);

        return new LeaveApplicationDto(
            entity.Id,
            entity.ReferenceNo,
            entity.ApplicantId,
            employee?.DisplayName ?? "Unknown",
            entity.LeaveTypeId,
            leaveType?.NameEn ?? "Unknown",
            entity.StartDate,
            entity.EndDate,
            entity.DurationDays,
            entity.Session,
            entity.Status,
            entity.Remarks);
    }

    public async Task<LeaveApplicationDto> UpdateAsync(Guid applicationId, LeaveApplicationUpdateRequest request, CancellationToken ct = default)
    {
        var application = await _applicationRepository.GetByIdAsync(applicationId, ct)
            ?? throw new InvalidOperationException("Application not found.");

        if (application.Status != LeaveStatus.Pending)
        {
            throw new InvalidOperationException("Only pending applications can be edited.");
        }

        var calc = await _leaveCalculationService.CalculateAsync(
            new LeaveCalculationRequest(
                request.StartDate,
                request.EndDate,
                application.Session,
                application.ApplicantId,
                application.LeaveTypeId),
            ct);

        if (calc.WorkingDays <= 0)
        {
            throw new InvalidOperationException("No working days selected for leave application.");
        }

        if (!calc.BalanceSufficient)
        {
            throw new InvalidOperationException("Insufficient leave balance for this application.");
        }

        application.StartDate = request.StartDate;
        application.EndDate = request.EndDate;
        application.DurationDays = calc.WorkingDays;
        application.Remarks = request.Remarks;
        application.UpdatedUtc = DateTime.UtcNow;

        await _applicationRepository.UpdateAsync(application, ct);

        var actorName = await ResolveActorNameAsync(request.ActorId, ct);
        await AddAuditAsync(
            application.Id,
            action: "Edited",
            actorId: request.ActorId,
            actorName,
            comment: request.Comment ?? request.Remarks,
            ct);

        var employees = await _employeeRepository.GetAllAsync(ct);
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(ct);
        var employeeMap = employees.ToDictionary(e => e.Id, e => e.DisplayName);
        var leaveTypeMap = leaveTypes.ToDictionary(t => t.Id, t => t.NameEn);

        return ToDto(application, employeeMap, leaveTypeMap);
    }

    public async Task ApproveAsync(Guid applicationId, ApprovalActionRequest request, CancellationToken ct = default)
    {
        var application = await _applicationRepository.GetByIdAsync(applicationId, ct)
            ?? throw new InvalidOperationException("Application not found.");

        if (application.Status != LeaveStatus.Pending)
        {
            throw new InvalidOperationException("Only pending applications can be approved.");
        }

        var balance = await _leaveBalanceRepository.GetAsync(application.ApplicantId, application.LeaveTypeId, ct)
            ?? throw new InvalidOperationException("Leave balance record not found.");

        if (balance.BalanceDays < application.DurationDays)
        {
            throw new InvalidOperationException("Balance changed and is no longer sufficient.");
        }

        balance.UsedDays += application.DurationDays;
        await _leaveBalanceRepository.UpdateAsync(balance, ct);

        application.Status = LeaveStatus.Approved;
        application.ApproverId = request.ApproverId;
        application.UpdatedUtc = DateTime.UtcNow;

        await _applicationRepository.UpdateAsync(application, ct);

        var actorName = await ResolveActorNameAsync(request.ApproverId, ct);
        await AddAuditAsync(
            application.Id,
            action: "Approved",
            actorId: request.ApproverId,
            actorName,
            comment: request.Comment,
            ct);
    }

    public async Task RejectAsync(Guid applicationId, ApprovalActionRequest request, CancellationToken ct = default)
    {
        var application = await _applicationRepository.GetByIdAsync(applicationId, ct)
            ?? throw new InvalidOperationException("Application not found.");

        if (application.Status != LeaveStatus.Pending)
        {
            throw new InvalidOperationException("Only pending applications can be rejected.");
        }

        application.Status = LeaveStatus.Rejected;
        application.ApproverId = request.ApproverId;
        application.UpdatedUtc = DateTime.UtcNow;

        await _applicationRepository.UpdateAsync(application, ct);

        var actorName = await ResolveActorNameAsync(request.ApproverId, ct);
        await AddAuditAsync(
            application.Id,
            action: "Rejected",
            actorId: request.ApproverId,
            actorName,
            comment: request.Comment,
            ct);
    }

    public async Task CancelAsync(Guid applicationId, LeaveApplicationCancelRequest request, CancellationToken ct = default)
    {
        var application = await _applicationRepository.GetByIdAsync(applicationId, ct)
            ?? throw new InvalidOperationException("Application not found.");

        if (application.Status == LeaveStatus.Cancelled)
        {
            return;
        }

        if (application.Status == LeaveStatus.Approved)
        {
            var balance = await _leaveBalanceRepository.GetAsync(application.ApplicantId, application.LeaveTypeId, ct)
                ?? throw new InvalidOperationException("Leave balance record not found.");
            balance.UsedDays = Math.Max(0, balance.UsedDays - application.DurationDays);
            await _leaveBalanceRepository.UpdateAsync(balance, ct);
        }

        application.Status = LeaveStatus.Cancelled;
        application.ApproverId = request.ActorId;
        application.UpdatedUtc = DateTime.UtcNow;
        await _applicationRepository.UpdateAsync(application, ct);

        var actorName = await ResolveActorNameAsync(request.ActorId, ct);
        await AddAuditAsync(
            application.Id,
            action: "Cancelled",
            actorId: request.ActorId,
            actorName,
            comment: request.Comment,
            ct);
    }

    public async Task<IReadOnlyList<LeaveApplicationAuditEntryDto>> GetAuditAsync(Guid applicationId, CancellationToken ct = default)
    {
        var entries = await _auditRepository.GetByApplicationIdAsync(applicationId, ct);

        return entries
            .OrderByDescending(x => x.TimestampUtc)
            .Select(x => new LeaveApplicationAuditEntryDto(
                x.Id,
                x.LeaveApplicationId,
                x.Action,
                x.ActorId,
                x.ActorName,
                x.Comment,
                x.TimestampUtc))
            .ToList();
    }

    private static LeaveApplicationDto ToDto(
        LeaveApplication application,
        IReadOnlyDictionary<Guid, string> employeeMap,
        IReadOnlyDictionary<Guid, string> leaveTypeMap)
    {
        employeeMap.TryGetValue(application.ApplicantId, out var applicantName);
        leaveTypeMap.TryGetValue(application.LeaveTypeId, out var leaveTypeName);

        return new LeaveApplicationDto(
            application.Id,
            application.ReferenceNo,
            application.ApplicantId,
            applicantName ?? "Unknown",
            application.LeaveTypeId,
            leaveTypeName ?? "Unknown",
            application.StartDate,
            application.EndDate,
            application.DurationDays,
            application.Session,
            application.Status,
            application.Remarks);
    }

    private async Task AddAuditAsync(
        Guid applicationId,
        string action,
        Guid actorId,
        string actorName,
        string? comment,
        CancellationToken ct)
    {
        var entry = new LeaveApplicationAuditEntry
        {
            LeaveApplicationId = applicationId,
            Action = action,
            ActorId = actorId,
            ActorName = actorName,
            Comment = comment,
            TimestampUtc = DateTime.UtcNow
        };

        await _auditRepository.AddAsync(entry, ct);
    }

    private async Task<string> ResolveActorNameAsync(Guid actorId, CancellationToken ct)
    {
        var actor = await _employeeRepository.GetByIdAsync(actorId, ct);
        return actor?.DisplayName ?? "System User";
    }
}

