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
using System.Text;


//namespace Monokoane_Property
namespace MonoxProperty
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            //Registering the DbContext with PostgreSQL
            builder.Services.AddDbContext<ApplicationDB>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
            //Mapping
            builder.Services.AddAutoMapper(typeof(Program));

            //Repo and interface
            builder.Services.AddScoped<IPropertyRepo, PropertyRepo>();
            builder.Services.AddScoped<IPropertyService, PropertyService>();

            builder.Services.AddScoped<ILeaseRepo, LeaseRepo>();
            builder.Services.AddScoped<ILeaseService, LeaseService>();

            builder.Services.AddScoped<ITenantRepo, TenantRepo>();
            builder.Services.AddScoped<ITenantService, TenantService>();

            builder.Services.AddScoped<IExpenseRepo, ExpenseRepo>();
            builder.Services.AddScoped<IExpenseService, ExpenseService>();
            builder.Services.AddAutoMapper(typeof(MappingProfile));

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // JWT config
            var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
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
            // Add repos/services
            builder.Services.AddScoped<IUserRepo, UserRepo>();
            builder.Services.AddScoped<JwtService>();


            var app = builder.Build();
       
           
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseRouting();
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.UseSwagger();
            app.UseSwaggerUI();

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

*/