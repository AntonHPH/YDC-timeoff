using Hutchison.Leave.Domain;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Hutchison.Leave.Infrastructure;

public static class SeedIds
{
    public static readonly Guid Bot0 = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid Bot1 = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid Bot2 = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid Bot3 = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid Bot4 = Guid.Parse("55555555-5555-5555-5555-555555555555");
    public static readonly Guid Bot5 = Guid.Parse("66666666-6666-6666-6666-666666666666");
    public static readonly Guid Bot6 = Guid.Parse("77777777-7777-7777-7777-777777777777");
    public static readonly Guid Bot7 = Guid.Parse("88888888-8888-8888-8888-888888888888");
    public static readonly Guid Bot8 = Guid.Parse("99999999-9999-9999-9999-999999999999");
    public static readonly Guid Bot9 = Guid.Parse("aaaaaaaa-1111-1111-1111-111111111111");
    public static readonly Guid Bot10 = Guid.Parse("bbbbbbbb-1111-1111-1111-111111111111");
    public static readonly Guid Bot11 = Guid.Parse("cccccccc-1111-1111-1111-111111111111");
    public static readonly Guid Bot12 = Guid.Parse("dddddddd-1111-1111-1111-111111111111");

    public static readonly Guid LeaveTypeAnnual = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid LeaveTypeComp = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid LeaveTypeSick = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    public static readonly Guid LeaveTypeWfh = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
}

internal sealed record PreferenceSettings(
    string Language,
    string Theme,
    bool NotificationEnabled,
    string DefaultCalendarView,
    bool DashboardPersonalizationEnabled)
{
    public static PreferenceSettings Default => new("English", "light", true, "month", true);
}

internal sealed class InMemoryDataStore
{
    private readonly object _syncRoot = new();
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly string _dataFilePath;

    public List<Employee> Employees { get; private set; } = [];
    public List<LeaveType> LeaveTypes { get; private set; } = [];
    public List<LeaveBalance> LeaveBalances { get; private set; } = [];
    public List<LeaveApplication> LeaveApplications { get; private set; } = [];
    public List<PublicHoliday> PublicHolidays { get; private set; } = [];
    public List<ReportingRelation> ReportingRelations { get; private set; } = [];
    public List<LeaveApplicationAuditEntry> LeaveApplicationAudits { get; private set; } = [];
    public Dictionary<Guid, string> UserRoles { get; private set; } = new();
    public PreferenceSettings PreferenceDefaults { get; set; } = PreferenceSettings.Default;

    public InMemoryDataStore()
    {
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };
        _jsonOptions.Converters.Add(new JsonStringEnumConverter());

        _dataFilePath = ResolveDataFilePath();

        var loaded = TryLoadData();
        if (loaded is null || HasLegacyHumanSeedData(loaded))
        {
            loaded = CreateSeedData();
            ApplyData(loaded);
            SaveChanges();
            return;
        }

        ApplyData(loaded);
    }

    private static bool HasLegacyHumanSeedData(PersistedData data)
    {
        var allowedBotEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "bot0@hutchisonports.com",
            "bot1@hutchisonports.com",
            "bot2@hutchisonports.com",
            "bot3@hutchisonports.com",
            "bot4@hutchisonports.com",
            "bot5@hutchisonports.com",
            "bot6@hutchisonports.com",
            "bot7@hutchisonports.com",
            "bot8@hutchisonports.com",
            "bot9@hutchisonports.com",
            "bot10@hutchisonports.com",
            "bot11@hutchisonports.com",
            "bot12@hutchisonports.com"
        };

        return data.Employees.Any(e => !allowedBotEmails.Contains(e.Email));
    }

    public void SaveChanges()
    {
        lock (_syncRoot)
        {
            SaveChangesUnsafe();
        }
    }

    public void ResetToSeed()
    {
        lock (_syncRoot)
        {
            ApplyData(CreateSeedData());
            SaveChangesUnsafe();
        }
    }

    public void ClearAllData()
    {
        lock (_syncRoot)
        {
            ApplyData(new PersistedData
            {
                Preferences = PreferenceSettings.Default
            });
            SaveChangesUnsafe();
        }
    }

    private static string ResolveDataFilePath()
    {
        var overridePath = Environment.GetEnvironmentVariable("HP_ELEAVE_DATA_FILE");
        if (!string.IsNullOrWhiteSpace(overridePath))
        {
            return overridePath;
        }

        return Path.Combine(AppContext.BaseDirectory, "data", "hp-eleave-store.json");
    }

    private PersistedData? TryLoadData()
    {
        if (!File.Exists(_dataFilePath))
        {
            return null;
        }

        try
        {
            var json = File.ReadAllText(_dataFilePath);
            var parsed = JsonSerializer.Deserialize<PersistedData>(json, _jsonOptions);
            if (parsed is null)
            {
                return null;
            }

            return parsed;
        }
        catch
        {
            return null;
        }
    }

    private void SaveChangesUnsafe()
    {
        var directory = Path.GetDirectoryName(_dataFilePath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var payload = BuildPersistedData();
        var json = JsonSerializer.Serialize(payload, _jsonOptions);
        File.WriteAllText(_dataFilePath, json);
    }

    private PersistedData BuildPersistedData()
    {
        return new PersistedData
        {
            Employees = Employees,
            LeaveTypes = LeaveTypes,
            LeaveBalances = LeaveBalances,
            LeaveApplications = LeaveApplications,
            PublicHolidays = PublicHolidays,
            ReportingRelations = ReportingRelations,
            LeaveApplicationAudits = LeaveApplicationAudits,
            UserRoles = UserRoles.Select(x => new UserRoleEntry(x.Key, x.Value)).ToList(),
            Preferences = PreferenceDefaults
        };
    }

    private void ApplyData(PersistedData data)
    {
        Employees = data.Employees ?? [];
        LeaveTypes = data.LeaveTypes ?? [];
        LeaveBalances = data.LeaveBalances ?? [];
        LeaveApplications = data.LeaveApplications ?? [];
        PublicHolidays = data.PublicHolidays ?? [];
        ReportingRelations = data.ReportingRelations ?? [];
        LeaveApplicationAudits = data.LeaveApplicationAudits ?? [];
        UserRoles = data.UserRoles?
            .GroupBy(x => x.EmployeeId)
            .Select(g => g.Last())
            .ToDictionary(x => x.EmployeeId, x => x.Role)
            ?? new Dictionary<Guid, string>();
        PreferenceDefaults = data.Preferences ?? PreferenceSettings.Default;
    }

    private static PersistedData CreateSeedData()
    {
        var employees = BuildEmployees();
        var leaveTypes = BuildLeaveTypes();
        var balances = BuildBalances();
        var applications = BuildLeaveApplications();

        return new PersistedData
        {
            Employees = employees,
            LeaveTypes = leaveTypes,
            LeaveBalances = balances,
            LeaveApplications = applications,
            PublicHolidays = BuildPublicHolidays(),
            ReportingRelations = BuildReportingRelations(),
            LeaveApplicationAudits = BuildSeedAudits(applications, employees),
            UserRoles = BuildUserRoles()
                .Select(x => new UserRoleEntry(x.Key, x.Value))
                .ToList(),
            Preferences = PreferenceSettings.Default
        };
    }

    private static List<Employee> BuildEmployees()
    {
        return
        [
            new Employee
            {
                Id = SeedIds.Bot0,
                EmployeeNo = "IT000",
                DisplayName = "Bot0",
                Email = "bot0@hutchisonports.com",
                PositionTitle = "Department Head",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "IT Leadership",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot1,
                EmployeeNo = "IT001",
                DisplayName = "Bot1",
                Email = "bot1@hutchisonports.com",
                PositionTitle = "Manager",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "Team 1",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot2,
                EmployeeNo = "IT003",
                DisplayName = "Bot2",
                Email = "bot2@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "Team 1",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot3,
                EmployeeNo = "IT004",
                DisplayName = "Bot3",
                Email = "bot3@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "Team 1",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot4,
                EmployeeNo = "IT005",
                DisplayName = "Bot4",
                Email = "bot4@hutchisonports.com",
                PositionTitle = "Manager",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "Team 2",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot5,
                EmployeeNo = "IT006",
                DisplayName = "Bot5",
                Email = "bot5@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "Team 2",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot6,
                EmployeeNo = "IT007",
                DisplayName = "Bot6",
                Email = "bot6@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "Team 2",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot7,
                EmployeeNo = "IT008",
                DisplayName = "Bot7",
                Email = "bot7@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "IT",
                Team = "Team 2",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot12,
                EmployeeNo = "FIN000",
                DisplayName = "Bot12",
                Email = "bot12@hutchisonports.com",
                PositionTitle = "Senior Manager",
                BusinessUnit = "HIT",
                Department = "Finance",
                Team = "Finance Leadership",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot8,
                EmployeeNo = "FIN001",
                DisplayName = "Bot8",
                Email = "bot8@hutchisonports.com",
                PositionTitle = "Manager",
                BusinessUnit = "HIT",
                Department = "Finance",
                Team = "Team 3",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot9,
                EmployeeNo = "FIN002",
                DisplayName = "Bot9",
                Email = "bot9@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "Finance",
                Team = "Team 3",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot10,
                EmployeeNo = "FIN003",
                DisplayName = "Bot10",
                Email = "bot10@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "Finance",
                Team = "Team 3",
                IsActive = true
            },
            new Employee
            {
                Id = SeedIds.Bot11,
                EmployeeNo = "FIN004",
                DisplayName = "Bot11",
                Email = "bot11@hutchisonports.com",
                PositionTitle = "Data Analyst",
                BusinessUnit = "HIT",
                Department = "Finance",
                Team = "Team 3",
                IsActive = true
            }
        ];
    }

    private static List<LeaveType> BuildLeaveTypes()
    {
        return
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
                MaxDaysPerApplication = 15,
                IsActive = true
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
                MaxDaysPerApplication = 5,
                IsActive = true
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
                MaxDaysPerApplication = 30,
                IsActive = true
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
                MaxDaysPerApplication = 20,
                IsActive = true
            }
        ];
    }

    private static List<LeaveBalance> BuildBalances()
    {
        return
        [
            new LeaveBalance { EmployeeId = SeedIds.Bot0, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 24, UsedDays = 4 },
            new LeaveBalance { EmployeeId = SeedIds.Bot0, LeaveTypeId = SeedIds.LeaveTypeComp, EntitledDays = 6, UsedDays = 1 },
            new LeaveBalance { EmployeeId = SeedIds.Bot0, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 14, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot1, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 20, UsedDays = 3 },
            new LeaveBalance { EmployeeId = SeedIds.Bot1, LeaveTypeId = SeedIds.LeaveTypeComp, EntitledDays = 4, UsedDays = 1 },
            new LeaveBalance { EmployeeId = SeedIds.Bot1, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 14, UsedDays = 1 },

            new LeaveBalance { EmployeeId = SeedIds.Bot2, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 16, UsedDays = 2 },
            new LeaveBalance { EmployeeId = SeedIds.Bot2, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot3, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 16, UsedDays = 1 },
            new LeaveBalance { EmployeeId = SeedIds.Bot3, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 1 },

            new LeaveBalance { EmployeeId = SeedIds.Bot4, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 20, UsedDays = 5 },
            new LeaveBalance { EmployeeId = SeedIds.Bot4, LeaveTypeId = SeedIds.LeaveTypeComp, EntitledDays = 4, UsedDays = 0 },
            new LeaveBalance { EmployeeId = SeedIds.Bot4, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 14, UsedDays = 1 },

            new LeaveBalance { EmployeeId = SeedIds.Bot5, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 16, UsedDays = 2 },
            new LeaveBalance { EmployeeId = SeedIds.Bot5, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot6, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 16, UsedDays = 3 },
            new LeaveBalance { EmployeeId = SeedIds.Bot6, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot7, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 16, UsedDays = 1 },
            new LeaveBalance { EmployeeId = SeedIds.Bot7, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 1 },

            new LeaveBalance { EmployeeId = SeedIds.Bot12, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 22, UsedDays = 3 },
            new LeaveBalance { EmployeeId = SeedIds.Bot12, LeaveTypeId = SeedIds.LeaveTypeComp, EntitledDays = 5, UsedDays = 1 },
            new LeaveBalance { EmployeeId = SeedIds.Bot12, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 14, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot8, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 18, UsedDays = 2 },
            new LeaveBalance { EmployeeId = SeedIds.Bot8, LeaveTypeId = SeedIds.LeaveTypeComp, EntitledDays = 3, UsedDays = 0 },
            new LeaveBalance { EmployeeId = SeedIds.Bot8, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 14, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot9, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 15, UsedDays = 2 },
            new LeaveBalance { EmployeeId = SeedIds.Bot9, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot10, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 15, UsedDays = 1 },
            new LeaveBalance { EmployeeId = SeedIds.Bot10, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 0 },

            new LeaveBalance { EmployeeId = SeedIds.Bot11, LeaveTypeId = SeedIds.LeaveTypeAnnual, EntitledDays = 15, UsedDays = 2 },
            new LeaveBalance { EmployeeId = SeedIds.Bot11, LeaveTypeId = SeedIds.LeaveTypeSick, EntitledDays = 12, UsedDays = 1 }
        ];
    }

    private static List<LeaveApplication> BuildLeaveApplications()
    {
        var today = DateTime.UtcNow.Date;

        return
        [
            new LeaveApplication
            {
                ReferenceNo = "REF20260803001",
                ApplicantId = SeedIds.Bot2,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(2),
                EndDate = today.AddDays(2),
                Session = LeaveSession.FullDay,
                DurationDays = 1,
                Status = LeaveStatus.Pending,
                Remarks = "Team event"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803002",
                ApplicantId = SeedIds.Bot2,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(5),
                EndDate = today.AddDays(6),
                Session = LeaveSession.FullDay,
                DurationDays = 2,
                Status = LeaveStatus.Pending,
                Remarks = "Personal leave"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803003",
                ApplicantId = SeedIds.Bot3,
                LeaveTypeId = SeedIds.LeaveTypeSick,
                StartDate = today.AddDays(-2),
                EndDate = today.AddDays(-1),
                Session = LeaveSession.FullDay,
                DurationDays = 2,
                Status = LeaveStatus.Approved,
                Remarks = "Medical appointment"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803004",
                ApplicantId = SeedIds.Bot5,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(4),
                EndDate = today.AddDays(4),
                Session = LeaveSession.FullDay,
                DurationDays = 1,
                Status = LeaveStatus.Approved,
                Remarks = "Family day"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803005",
                ApplicantId = SeedIds.Bot6,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(9),
                EndDate = today.AddDays(10),
                Session = LeaveSession.FullDay,
                DurationDays = 2,
                Status = LeaveStatus.Rejected,
                Remarks = "Quarter close support needed"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803006",
                ApplicantId = SeedIds.Bot7,
                LeaveTypeId = SeedIds.LeaveTypeSick,
                StartDate = today.AddDays(1),
                EndDate = today.AddDays(1),
                Session = LeaveSession.FullDay,
                DurationDays = 1,
                Status = LeaveStatus.Pending,
                Remarks = "Clinic follow-up"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803007",
                ApplicantId = SeedIds.Bot9,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(7),
                EndDate = today.AddDays(8),
                Session = LeaveSession.FullDay,
                DurationDays = 2,
                Status = LeaveStatus.Approved,
                Remarks = "Family trip"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803008",
                ApplicantId = SeedIds.Bot10,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(10),
                EndDate = today.AddDays(11),
                Session = LeaveSession.FullDay,
                DurationDays = 2,
                Status = LeaveStatus.Pending,
                Remarks = "Annual leave"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803009",
                ApplicantId = SeedIds.Bot11,
                LeaveTypeId = SeedIds.LeaveTypeSick,
                StartDate = today.AddDays(-3),
                EndDate = today.AddDays(-3),
                Session = LeaveSession.FullDay,
                DurationDays = 1,
                Status = LeaveStatus.Cancelled,
                Remarks = "Cancelled after recovery"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803010",
                ApplicantId = SeedIds.Bot8,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(3),
                EndDate = today.AddDays(3),
                Session = LeaveSession.FullDay,
                DurationDays = 1,
                Status = LeaveStatus.Approved,
                Remarks = "Department planning"
            },
            new LeaveApplication
            {
                ReferenceNo = "REF20260803011",
                ApplicantId = SeedIds.Bot12,
                LeaveTypeId = SeedIds.LeaveTypeAnnual,
                StartDate = today.AddDays(14),
                EndDate = today.AddDays(15),
                Session = LeaveSession.FullDay,
                DurationDays = 2,
                Status = LeaveStatus.Pending,
                Remarks = "Finance offsite"
            }
        ];
    }

    private static List<PublicHoliday> BuildPublicHolidays()
    {
        var currentYear = DateTime.UtcNow.Year;
        return
        [
            new PublicHoliday { Date = new DateTime(currentYear, 1, 1), Name = "New Year" },
            new PublicHoliday { Date = new DateTime(currentYear, 5, 1), Name = "Labour Day" },
            new PublicHoliday { Date = new DateTime(currentYear, 7, 1), Name = "HKSAR Establishment Day" },
            new PublicHoliday { Date = new DateTime(currentYear, 10, 1), Name = "National Day" },
            new PublicHoliday { Date = new DateTime(currentYear, 12, 25), Name = "Christmas" },
            new PublicHoliday { Date = new DateTime(currentYear, 12, 26), Name = "Boxing Day" }
        ];
    }

    private static List<ReportingRelation> BuildReportingRelations()
    {
        return
        [
            new ReportingRelation { ManagerId = SeedIds.Bot0, EmployeeId = SeedIds.Bot1, Sequence = 1 },
            new ReportingRelation { ManagerId = SeedIds.Bot0, EmployeeId = SeedIds.Bot4, Sequence = 2 },

            new ReportingRelation { ManagerId = SeedIds.Bot1, EmployeeId = SeedIds.Bot2, Sequence = 1 },
            new ReportingRelation { ManagerId = SeedIds.Bot1, EmployeeId = SeedIds.Bot3, Sequence = 2 },

            new ReportingRelation { ManagerId = SeedIds.Bot4, EmployeeId = SeedIds.Bot5, Sequence = 1 },
            new ReportingRelation { ManagerId = SeedIds.Bot4, EmployeeId = SeedIds.Bot6, Sequence = 2 },
            new ReportingRelation { ManagerId = SeedIds.Bot4, EmployeeId = SeedIds.Bot7, Sequence = 3 },

            new ReportingRelation { ManagerId = SeedIds.Bot12, EmployeeId = SeedIds.Bot8, Sequence = 1 },
            new ReportingRelation { ManagerId = SeedIds.Bot8, EmployeeId = SeedIds.Bot9, Sequence = 1 },
            new ReportingRelation { ManagerId = SeedIds.Bot8, EmployeeId = SeedIds.Bot10, Sequence = 2 },
            new ReportingRelation { ManagerId = SeedIds.Bot8, EmployeeId = SeedIds.Bot11, Sequence = 3 }
        ];
    }

    private static Dictionary<Guid, string> BuildUserRoles()
    {
        return new Dictionary<Guid, string>
        {
            [SeedIds.Bot0] = "SystemAdministrator",
            [SeedIds.Bot1] = "Manager",
            [SeedIds.Bot2] = "Employee",
            [SeedIds.Bot3] = "Employee",
            [SeedIds.Bot4] = "Manager",
            [SeedIds.Bot5] = "Employee",
            [SeedIds.Bot6] = "Employee",
            [SeedIds.Bot7] = "Employee",
            [SeedIds.Bot12] = "Manager",
            [SeedIds.Bot8] = "Supervisor",
            [SeedIds.Bot9] = "Employee",
            [SeedIds.Bot10] = "Employee",
            [SeedIds.Bot11] = "Employee"
        };
    }

    private static List<LeaveApplicationAuditEntry> BuildSeedAudits(
        IReadOnlyList<LeaveApplication> applications,
        IReadOnlyList<Employee> employees)
    {
        var employeeMap = employees.ToDictionary(x => x.Id, x => x.DisplayName);
        var adminName = employeeMap.TryGetValue(SeedIds.Bot0, out var name) ? name : "System Admin";
        var result = new List<LeaveApplicationAuditEntry>();

        foreach (var application in applications)
        {
            employeeMap.TryGetValue(application.ApplicantId, out var applicantName);
            result.Add(new LeaveApplicationAuditEntry
            {
                LeaveApplicationId = application.Id,
                Action = "Created",
                ActorId = application.ApplicantId,
                ActorName = applicantName ?? "Unknown",
                Comment = application.Remarks,
                TimestampUtc = application.CreatedUtc
            });

            if (application.Status is LeaveStatus.Approved or LeaveStatus.Rejected or LeaveStatus.Cancelled)
            {
                result.Add(new LeaveApplicationAuditEntry
                {
                    LeaveApplicationId = application.Id,
                    Action = application.Status.ToString(),
                    ActorId = SeedIds.Bot0,
                    ActorName = adminName,
                    Comment = $"{application.Status} by workflow",
                    TimestampUtc = application.CreatedUtc.AddMinutes(30)
                });
            }
        }

        return result;
    }

    private sealed class PersistedData
    {
        public List<Employee> Employees { get; set; } = [];
        public List<LeaveType> LeaveTypes { get; set; } = [];
        public List<LeaveBalance> LeaveBalances { get; set; } = [];
        public List<LeaveApplication> LeaveApplications { get; set; } = [];
        public List<PublicHoliday> PublicHolidays { get; set; } = [];
        public List<ReportingRelation> ReportingRelations { get; set; } = [];
        public List<LeaveApplicationAuditEntry> LeaveApplicationAudits { get; set; } = [];
        public List<UserRoleEntry> UserRoles { get; set; } = [];
        public PreferenceSettings Preferences { get; set; } = PreferenceSettings.Default;
    }

    private sealed record UserRoleEntry(Guid EmployeeId, string Role);
}

