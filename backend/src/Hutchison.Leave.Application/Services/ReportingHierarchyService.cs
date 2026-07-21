namespace Hutchison.Leave.Application.Services;

public sealed class ReportingHierarchyService : IReportingHierarchyService
{
    private readonly IReportingRepository _reportingRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public ReportingHierarchyService(IReportingRepository reportingRepository, IEmployeeRepository employeeRepository)
    {
        _reportingRepository = reportingRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<IReadOnlyList<HierarchyNodeDto>> GetTreeAsync(CancellationToken ct = default)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);
        var relations = await _reportingRepository.GetAllAsync(ct);

        var childrenMap = relations
            .GroupBy(r => r.ManagerId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.EmployeeId).ToList());

        var hasManager = relations.Select(r => r.EmployeeId).ToHashSet();
        var roots = employees.Where(e => !hasManager.Contains(e.Id)).ToList();

        var employeeMap = employees.ToDictionary(x => x.Id, x => x);

        return roots.Select(root => BuildNode(root.Id, employeeMap, childrenMap)).ToList();
    }

    public async Task<HierarchyValidationResult> ValidateAsync(CancellationToken ct = default)
    {
        var employees = await _employeeRepository.GetAllAsync(ct);
        var relations = await _reportingRepository.GetAllAsync(ct);

        var messages = new List<string>();

        var hasManager = relations.Select(r => r.EmployeeId).ToHashSet();
        var rootCount = employees.Count(e => !hasManager.Contains(e.Id));
        var hasMissingApprovers = employees.Any(e => !hasManager.Contains(e.Id)) && rootCount > 1;
        if (hasMissingApprovers)
        {
            messages.Add("Some employees are disconnected from a single approval root.");
        }

        var adjacency = relations
            .GroupBy(r => r.ManagerId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.EmployeeId).ToList());

        var hasCircular = DetectCircular(adjacency, employees.Select(x => x.Id).ToList());
        if (hasCircular)
        {
            messages.Add("Circular reporting path detected.");
        }

        var bottlenecks = relations.GroupBy(r => r.ManagerId).Where(g => g.Count() > 8).ToList();
        var hasBottlenecks = bottlenecks.Count > 0;
        if (hasBottlenecks)
        {
            messages.Add("One or more managers have more than 8 direct reports.");
        }

        if (messages.Count == 0)
        {
            messages.Add("Hierarchy validation passed.");
        }

        return new HierarchyValidationResult(hasMissingApprovers, hasCircular, hasBottlenecks, messages);
    }

    private static HierarchyNodeDto BuildNode(
        Guid employeeId,
        IReadOnlyDictionary<Guid, Domain.Employee> employeeMap,
        IReadOnlyDictionary<Guid, List<Guid>> childrenMap)
    {
        var employee = employeeMap[employeeId];
        var children = childrenMap.TryGetValue(employeeId, out var reports)
            ? reports.Select(id => BuildNode(id, employeeMap, childrenMap)).ToList()
            : new List<HierarchyNodeDto>();

        return new HierarchyNodeDto(employee.Id, employee.DisplayName, employee.PositionTitle, children);
    }

    private static bool DetectCircular(IReadOnlyDictionary<Guid, List<Guid>> adjacency, IReadOnlyList<Guid> nodes)
    {
        var visiting = new HashSet<Guid>();
        var visited = new HashSet<Guid>();

        foreach (var node in nodes)
        {
            if (visited.Contains(node))
            {
                continue;
            }

            if (HasCycle(node, adjacency, visiting, visited))
            {
                return true;
            }
        }

        return false;
    }

    private static bool HasCycle(
        Guid node,
        IReadOnlyDictionary<Guid, List<Guid>> adjacency,
        HashSet<Guid> visiting,
        HashSet<Guid> visited)
    {
        if (visiting.Contains(node))
        {
            return true;
        }

        if (visited.Contains(node))
        {
            return false;
        }

        visiting.Add(node);
        if (adjacency.TryGetValue(node, out var children))
        {
            foreach (var child in children)
            {
                if (HasCycle(child, adjacency, visiting, visited))
                {
                    return true;
                }
            }
        }

        visiting.Remove(node);
        visited.Add(node);
        return false;
    }
}

