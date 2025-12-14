using Microsoft.EntityFrameworkCore;
using MonoxProperty;
using MonoxProperty.Dtos;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MonoxProperty.Middleware;
using System.Text;
// using Microsoft.OpenApi.Models; (removed - not needed)


//namespace Monokoane_Property
namespace MonoxProperty
{
    public class Program
    {
        public static void Main(string[] args)
        {
           // ... other usings ...

var builder = WebApplication.CreateBuilder(args);

// === Services ===
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// DbContext
builder.Services.AddDbContext<ApplicationDB>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Repos & Services
builder.Services.AddScoped<IUserRepo, UserRepo>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<IPropertyRepo, PropertyRepo>();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<ITenantRepo, TenantRepo>();
builder.Services.AddScoped<ILeaseService, LeaseService>();
builder.Services.AddScoped<ILeaseRepo, LeaseRepo>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IExpenseRepo, ExpenseRepo>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Other repos/services (keep your existing ones)

// Swagger
builder.Services.AddSwaggerGen();

// JWT Auth
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("Jwt:Key is missing.");
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

var app = builder.Build();

// === Pipeline ===
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
        }
    }
}

/*


-database update
dotnet ef migrations add InitialCreate
dotnet ef database update

-To run the application
dotnet clean
dotnet build
dotnet run


If you're mapping to DTOs using AutoMapper, make sure the DTO also includes a list for Expenses:
*/