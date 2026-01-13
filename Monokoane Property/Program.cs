using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using MonoxProperty;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using MonoxProperty.Repository;
using MonoxProperty.Services;
using MonoxProperty.Mapping;
using MonoxProperty.Middleware;

namespace MonoxProperty
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // =========================
            // SERVICES
            // =========================

            // Add Controllers with JSON enum support
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // DbContext
            builder.Services.AddDbContext<ApplicationDB>(options =>
                options.UseNpgsql(
                    builder.Configuration.GetConnectionString("DefaultConnection")));

            // AutoMapper
            builder.Services.AddAutoMapper(typeof(MappingProfile));

            // Repositories & Services
            builder.Services.AddScoped<IUserRepo, UserRepo>();
            builder.Services.AddScoped<IPropertyRepo, PropertyRepo>();
            builder.Services.AddScoped<IPropertyService, PropertyService>();
            builder.Services.AddScoped<ITenantRepo, TenantRepo>();
            builder.Services.AddScoped<ITenantService, TenantService>();
            builder.Services.AddScoped<ILeaseRepo, LeaseRepo>();
            builder.Services.AddScoped<ILeaseService, LeaseService>();
            builder.Services.AddScoped<IExpenseRepo, ExpenseRepo>();
            builder.Services.AddScoped<IExpenseService, ExpenseService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<JwtService>();
            builder.Services.AddScoped<IExcelExportService, ExcelService>();
            builder.Services.AddScoped<IExpenseService, ExpenseService>(); 
            builder.Services.AddScoped<AuthService>();


            // JWT Authentication
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

            // ✅ CORS - Configure with explicit origin for React/Vite dev server
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins("http://localhost:5173") // Vite default dev server
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // Safe because origin is explicit
                });
            });

            // =========================
            // BUILD THE APP
            // =========================
            var app = builder.Build();

            // =========================
            // DATABASE MIGRATION
            // =========================
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDB>();

                try
                {
                    Console.WriteLine("Applying migrations...");
                    dbContext.Database.Migrate();

                    Console.WriteLine("Testing database connection...");
                    if (dbContext.Database.CanConnect())
                    {
                        Console.WriteLine("Database connected successfully.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Database error: {ex.Message}");
                    throw;
                }
            }

            // =========================
            // MIDDLEWARE PIPELINE
            // =========================
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // ✅ CORS MUST come BEFORE UseRouting, UseAuthentication, etc.
            app.UseCors(); // Applies the default policy defined above

            app.UseRouting();

            app.UseMiddleware<ErrorHandlingMiddleware>();
            app.UseJwtLogging();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
/*
dotnet clean
dotnet build
dotnet run

*/