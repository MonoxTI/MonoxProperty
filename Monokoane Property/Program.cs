using Microsoft.EntityFrameworkCore;
using MonoxProperty;


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
            builder.Services.AddAutoMapper(typeof(MappingProfile));




            var app = builder.Build();

       
           
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}

/*
dotnet build

-database update
dotnet ef migrations add InitialCreate
dotnet ef database update

dotnet run

*/