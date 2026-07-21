-- Hutchison Ports E-Leave SQL Server baseline schema

CREATE TABLE BusinessUnits (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Code NVARCHAR(30) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    CreatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Departments (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    BusinessUnitId UNIQUEIDENTIFIER NOT NULL,
    Code NVARCHAR(30) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    CreatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Departments_BusinessUnits FOREIGN KEY (BusinessUnitId) REFERENCES BusinessUnits(Id)
);

CREATE TABLE Teams (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    DepartmentId UNIQUEIDENTIFIER NOT NULL,
    Code NVARCHAR(30) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    CreatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Teams_Departments FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);

CREATE TABLE Employees (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    EmployeeNo NVARCHAR(30) NOT NULL,
    DisplayName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NOT NULL,
    PositionTitle NVARCHAR(100) NULL,
    TeamId UNIQUEIDENTIFIER NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Employees_Teams FOREIGN KEY (TeamId) REFERENCES Teams(Id)
);

CREATE TABLE LeaveTypes (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    BusinessUnitId UNIQUEIDENTIFIER NOT NULL,
    NameEn NVARCHAR(120) NOT NULL,
    NameTc NVARCHAR(120) NULL,
    NameSc NVARCHAR(120) NULL,
    Status NVARCHAR(20) NOT NULL,
    Code NVARCHAR(20) NOT NULL,
    ShortDescription NVARCHAR(300) NULL,
    HrmsCode NVARCHAR(30) NULL,

    RequireHrVerification BIT NOT NULL DEFAULT 0,
    RequireComments BIT NOT NULL DEFAULT 0,
    CancelRequiresComments BIT NOT NULL DEFAULT 0,
    RequireExtraApproval BIT NOT NULL DEFAULT 0,
    UseDottedLineSecondApprover BIT NOT NULL DEFAULT 0,
    RequireExportToHrms BIT NOT NULL DEFAULT 0,

    ExcludeHoliday BIT NOT NULL DEFAULT 1,
    AllowPostDateApplication BIT NOT NULL DEFAULT 0,
    PostDateRequiresComment BIT NOT NULL DEFAULT 0,
    PeriodOfServiceMonth INT NOT NULL DEFAULT 0,
    PassProbation BIT NOT NULL DEFAULT 0,
    OneTimeOnly BIT NOT NULL DEFAULT 0,

    MaxAccumulatedDays DECIMAL(6,2) NULL,
    MaxWithdrawalDays DECIMAL(6,2) NULL,
    MaxDaysPerApplication DECIMAL(6,2) NULL,
    MinDaysPerApplication DECIMAL(6,2) NULL,
    DefaultLeaveDays DECIMAL(6,2) NULL,
    IsAccumulative BIT NOT NULL DEFAULT 0,
    DisplayBalance BIT NOT NULL DEFAULT 1,
    CheckEligibility BIT NOT NULL DEFAULT 1,

    ApplicableGender NVARCHAR(20) NOT NULL DEFAULT 'All',
    AdministratorOnly BIT NOT NULL DEFAULT 0,
    RequireSupportingDocument BIT NOT NULL DEFAULT 0,

    EmailAlertToHr BIT NOT NULL DEFAULT 0,
    OverdueReminderOffsetHour INT NULL,

    AdditionalInformation NVARCHAR(1000) NULL,
    PolicyEnglish NVARCHAR(MAX) NULL,
    PolicyTraditionalChinese NVARCHAR(MAX) NULL,
    PolicySimplifiedChinese NVARCHAR(MAX) NULL,

    HrOnlySupportingDocs BIT NOT NULL DEFAULT 0,
    TimeOffIntegrated BIT NOT NULL DEFAULT 0,
    ExportToHrms BIT NOT NULL DEFAULT 0,

    CreatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedUtc DATETIME2 NULL,
    CONSTRAINT FK_LeaveTypes_BusinessUnits FOREIGN KEY (BusinessUnitId) REFERENCES BusinessUnits(Id)
);

CREATE TABLE LeaveBalances (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    EmployeeId UNIQUEIDENTIFIER NOT NULL,
    LeaveTypeId UNIQUEIDENTIFIER NOT NULL,
    EntitledDays DECIMAL(8,2) NOT NULL,
    UsedDays DECIMAL(8,2) NOT NULL DEFAULT 0,
    BalanceDays AS (EntitledDays - UsedDays),
    UpdatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_LeaveBalances_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(Id),
    CONSTRAINT FK_LeaveBalances_LeaveTypes FOREIGN KEY (LeaveTypeId) REFERENCES LeaveTypes(Id)
);

CREATE TABLE LeaveApplications (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ReferenceNo NVARCHAR(30) NOT NULL,
    ApplicantId UNIQUEIDENTIFIER NOT NULL,
    LeaveTypeId UNIQUEIDENTIFIER NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    SessionType NVARCHAR(20) NOT NULL,
    DurationDays DECIMAL(8,2) NOT NULL,
    Remarks NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL,
    ApproverId UNIQUEIDENTIFIER NULL,
    CreatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedUtc DATETIME2 NULL,
    CONSTRAINT FK_LeaveApplications_Employees_Applicant FOREIGN KEY (ApplicantId) REFERENCES Employees(Id),
    CONSTRAINT FK_LeaveApplications_LeaveTypes FOREIGN KEY (LeaveTypeId) REFERENCES LeaveTypes(Id),
    CONSTRAINT FK_LeaveApplications_Employees_Approver FOREIGN KEY (ApproverId) REFERENCES Employees(Id)
);

CREATE TABLE ApprovalRecords (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    LeaveApplicationId UNIQUEIDENTIFIER NOT NULL,
    ApproverId UNIQUEIDENTIFIER NOT NULL,
    SequenceNo INT NOT NULL,
    Action NVARCHAR(20) NOT NULL,
    Comment NVARCHAR(500) NULL,
    ActionUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ApprovalRecords_LeaveApplications FOREIGN KEY (LeaveApplicationId) REFERENCES LeaveApplications(Id),
    CONSTRAINT FK_ApprovalRecords_Employees FOREIGN KEY (ApproverId) REFERENCES Employees(Id)
);

CREATE TABLE ApplicationAttachments (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    LeaveApplicationId UNIQUEIDENTIFIER NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    BlobPath NVARCHAR(500) NOT NULL,
    HrOnly BIT NOT NULL DEFAULT 0,
    UploadedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ApplicationAttachments_LeaveApplications FOREIGN KEY (LeaveApplicationId) REFERENCES LeaveApplications(Id)
);

CREATE TABLE PublicHolidays (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    BusinessUnitId UNIQUEIDENTIFIER NOT NULL,
    HolidayDate DATETIME2 NOT NULL,
    HolidayName NVARCHAR(120) NOT NULL,
    IsRecurring BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_PublicHolidays_BusinessUnits FOREIGN KEY (BusinessUnitId) REFERENCES BusinessUnits(Id)
);

CREATE TABLE Roles (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    RoleCode NVARCHAR(50) NOT NULL,
    RoleName NVARCHAR(100) NOT NULL
);

CREATE TABLE UserRoles (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    EmployeeId UNIQUEIDENTIFIER NOT NULL,
    RoleId UNIQUEIDENTIFIER NOT NULL,
    CreatedUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_UserRoles_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(Id),
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

CREATE INDEX IX_LeaveApplications_ApplicantId_Status ON LeaveApplications(ApplicantId, Status);
CREATE INDEX IX_LeaveApplications_StartDate_EndDate ON LeaveApplications(StartDate, EndDate);
CREATE INDEX IX_LeaveBalances_Employee_LeaveType ON LeaveBalances(EmployeeId, LeaveTypeId);

