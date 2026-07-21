using Hutchison.Leave.Application;
using Hutchison.Leave.Infrastructure;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173");
    });
});

var app = builder.Build();

app.UseCors("frontend");
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    service = "Hutchison Ports E-Leave API",
    status = "running",
    timestampUtc = DateTime.UtcNow
}));

app.Run();



