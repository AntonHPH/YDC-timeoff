namespace Hutchison.Leave.Domain;

public enum LeaveStatus
{
    Pending,
    Approved,
    Rejected,
    Cancelled
}

public enum LeaveSession
{
    FullDay,
    AM,
    PM
}

public abstract class Entity
{
    public Guid Id { get; init; } = Guid.NewGuid();
}

public sealed class Employee : Entity
{
    public required string EmployeeNo { get; init; }
    public required string DisplayName { get; init; }
    public required string Email { get; init; }
    public required string PositionTitle { get; init; }
    public required string BusinessUnit { get; init; }
    public required string Department { get; init; }
    public required string Team { get; init; }
    public bool IsActive { get; init; } = true;
}

public sealed class LeaveType : Entity
{
    public required string Code { get; init; }
    public required string NameEn { get; init; }
    public string? NameTc { get; init; }
    public string? NameSc { get; init; }

    public bool RequireHrVerification { get; init; }
    public bool RequireComments { get; init; }
    public bool ExcludeHoliday { get; init; }
    public bool AllowPostDateApplication { get; init; }
    public bool RequireSupportingDocument { get; init; }

    public decimal MinDaysPerApplication { get; init; }
    public decimal MaxDaysPerApplication { get; init; }
    public bool IsActive { get; init; } = true;
}

public sealed class LeaveBalance : Entity
{
    public required Guid EmployeeId { get; init; }
    public required Guid LeaveTypeId { get; init; }
    public decimal EntitledDays { get; set; }
    public decimal UsedDays { get; set; }
    public decimal BalanceDays => EntitledDays - UsedDays;
}

public sealed class LeaveApplication : Entity
{
    public required string ReferenceNo { get; init; }
    public required Guid ApplicantId { get; init; }
    public required Guid LeaveTypeId { get; init; }
    public required DateTime StartDate { get; init; }
    public required DateTime EndDate { get; init; }
    public required LeaveSession Session { get; init; }
    public required decimal DurationDays { get; init; }
    public string? Remarks { get; init; }
    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;
    public Guid? ApproverId { get; set; }
    public DateTime CreatedUtc { get; init; } = DateTime.UtcNow;
    public DateTime? UpdatedUtc { get; set; }

    public bool Overlaps(DateTime from, DateTime to)
    {
        return StartDate.Date <= to.Date && EndDate.Date >= from.Date;
    }
}

public sealed class ApprovalRecord : Entity
{
    public required Guid LeaveApplicationId { get; init; }
    public required Guid ApproverId { get; init; }
    public required int SequenceNo { get; init; }
    public required string Action { get; init; }
    public string? Comment { get; init; }
    public DateTime ActionUtc { get; init; } = DateTime.UtcNow;
}

public sealed class PublicHoliday : Entity
{
    public required DateTime Date { get; init; }
    public required string Name { get; init; }
}

public sealed class ReportingRelation : Entity
{
    public required Guid ManagerId { get; init; }
    public required Guid EmployeeId { get; init; }
    public required int Sequence { get; init; }
}

