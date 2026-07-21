using Hutchison.Leave.Domain;

namespace Hutchison.Leave.Infrastructure;

public static class SeedIds
{
    public static readonly Guid EmployeeAlice = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid EmployeeBob = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid EmployeeCharlie = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid EmployeeDiana = Guid.Parse("44444444-4444-4444-4444-444444444444");

    public static readonly Guid LeaveTypeAnnual = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid LeaveTypeComp = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid LeaveTypeSick = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    public static readonly Guid LeaveTypeWfh = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
}

internal sealed class InMemoryDataStore
{
    public List<Employee> Employees { get; } =
    [
        new Employee
        {
            Id = SeedIds.EmployeeAlice,
            EmployeeNo = "E1001",
            DisplayName = "Alice Wong",
            Email = "alice.wong@hutchisonports.com",
            PositionTitle = "Operations Manager",
            BusinessUnit = "Hong Kong Terminal",
            Department = "Operations",
            Team = "Yard Ops"
        },
        new Employee
        {
            Id = SeedIds.EmployeeBob,
            EmployeeNo = "E1002",
            DisplayName = "Bob Chan",
            Email = "bob.chan@hutchisonports.com",
            PositionTitle = "Supervisor",
            BusinessUnit = "Hong Kong Terminal",
            Department = "Operations",
            Team = "Yard Ops"
        },
        new Employee
        {
            Id = SeedIds.EmployeeCharlie,
            EmployeeNo = "E2001",
            DisplayName = "Charlie Lee",
            Email = "charlie.lee@hutchisonports.com",
            PositionTitle = "HR Executive",
            BusinessUnit = "Hong Kong Terminal",
            Department = "HR",
            Team = "HR Services"
        },
        new Employee
        {
            Id = SeedIds.EmployeeDiana,
            EmployeeNo = "E3001",
            DisplayName = "Diana Lam",
            Email = "diana.lam@hutchisonports.com",
            PositionTitle = "IT Analyst",
            BusinessUnit = "Hong Kong Terminal",
            Department = "IT",
            Team = "Applications"
        }
    ];

    public List<LeaveType> LeaveTypes { get; } =
    [
        new LeaveType
        {
            Id = SeedIds.LeaveTypeAnnual,
            Code = "AL",
            NameEn = "Annual Leave",
            NameTc = "Annual Leave TC",
            NameSc = "Annual Leave SC",
            RequireHrVerification = false,
            RequireComments = false,
            ExcludeHoliday = true,
            AllowPostDateApplication = false,
            RequireSupportingDocument = false,
            MinDaysPerApplication = 0.5m,
            MaxDaysPerApplication = 15
        },
        new LeaveType
        {
            Id = SeedIds.LeaveTypeComp,
            Code = "COMP",
            NameEn = "Compensation Leave",
            NameTc = "Compensation Leave TC",
            NameSc = "Compensation Leave SC",
            RequireHrVerification = true,
            RequireComments = true,
            ExcludeHoliday = true,
            AllowPostDateApplication = true,
            RequireSupportingDocument = true,
            MinDaysPerApplication = 0.5m,
            MaxDaysPerApplication = 5
        },
        new LeaveType
        {
            Id = SeedIds.LeaveTypeSick,
            Code = "SICK",
            NameEn = "Sick Leave",
            NameTc = "Sick Leave TC",
            NameSc = "Sick Leave SC",
            RequireHrVerification = false,
            RequireComments = false,
            ExcludeHoliday = false,
            AllowPostDateApplication = true,
            RequireSupportingDocument = true,
            MinDaysPerApplication = 0.5m,
            MaxDaysPerApplication = 30
        },
        new LeaveType
        {
            Id = SeedIds.LeaveTypeWfh,
            Code = "WFH",
            NameEn = "Work From Home",
            NameTc = "Work From Home TC",
            NameSc = "Work From Home SC",
            RequireHrVerification = false,
            RequireComments = false,
            ExcludeHoliday = true,
            AllowPostDateApplication = false,
            RequireSupportingDocument = false,
            MinDaysPerApplication = 0.5m,
            MaxDaysPerApplication = 20
        }
    ];

    public List<LeaveBalance> LeaveBalances { get; } =
    [
        new LeaveBalance { EmployeeId = SeedIds.EmployeeAlice, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 20, UsedDays = 4 },
        new LeaveBalance { EmployeeId = SeedIds.EmployeeAlice, LeaveTypeId = SeedIds.LeaveTypeComp, EntitledDays = 6, UsedDays = 1 },
        new LeaveBalance { EmployeeId = SeedIds.EmployeeAlice, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 14, UsedDays = 2 },
        new LeaveBalance { EmployeeId = SeedIds.EmployeeBob, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 16, UsedDays = 8 },
        new LeaveBalance { EmployeeId = SeedIds.EmployeeBob, LeaveTypeId = SeedIds.LeaveTypeComp, EntitledDays = 3, UsedDays = 0 },
        new LeaveBalance { EmployeeId = SeedIds.EmployeeDiana, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 18, UsedDays = 6 },
        new LeaveBalance { EmployeeId = SeedIds.EmployeeDiana, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 14, UsedDays = 1 }
    ];

    public List<LeaveApplication> LeaveApplications { get; } =
    [
        new LeaveApplication
        {
            ReferenceNo = "REF20260710001",
            ApplicantId = SeedIds.EmployeeBob,
            LeaveTypeId = SeedIds.LeaveTypeAnnual,
            StartDate = DateTime.UtcNow.Date.AddDays(2),
            EndDate = DateTime.UtcNow.Date.AddDays(3),
            Session = LeaveSession.FullDay,
            DurationDays = 2,
            Status = LeaveStatus.Pending,
            Remarks = "Family commitment"
        },
        new LeaveApplication
        {
            ReferenceNo = "REF20260710002",
            ApplicantId = SeedIds.EmployeeAlice,
            LeaveTypeId = SeedIds.LeaveTypeAnnual,
            StartDate = DateTime.UtcNow.Date.AddDays(5),
            EndDate = DateTime.UtcNow.Date.AddDays(6),
            Session = LeaveSession.FullDay,
            DurationDays = 2,
            Status = LeaveStatus.Approved,
            Remarks = "Short break"
        },
        new LeaveApplication
        {
            ReferenceNo = "REF20260710003",
            ApplicantId = SeedIds.EmployeeDiana,
            LeaveTypeId = SeedIds.LeaveTypeSick,
            StartDate = DateTime.UtcNow.Date.AddDays(-2),
            EndDate = DateTime.UtcNow.Date.AddDays(-1),
            Session = LeaveSession.FullDay,
            DurationDays = 2,
            Status = LeaveStatus.Approved,
            Remarks = "Medical"
        }
    ];

    public List<PublicHoliday> PublicHolidays { get; } =
    [
        new PublicHoliday { Date = new DateTime(DateTime.UtcNow.Year, 12, 25), Name = "Christmas" },
        new PublicHoliday { Date = new DateTime(DateTime.UtcNow.Year, 1, 1), Name = "New Year" }
    ];

    public List<ReportingRelation> ReportingRelations { get; } =
    [
        new ReportingRelation { ManagerId = SeedIds.EmployeeAlice, EmployeeId = SeedIds.EmployeeBob, Sequence = 1 },
        new ReportingRelation { ManagerId = SeedIds.EmployeeAlice, EmployeeId = SeedIds.EmployeeCharlie, Sequence = 1 },
        new ReportingRelation { ManagerId = SeedIds.EmployeeBob, EmployeeId = SeedIds.EmployeeDiana, Sequence = 1 }
    ];
}

