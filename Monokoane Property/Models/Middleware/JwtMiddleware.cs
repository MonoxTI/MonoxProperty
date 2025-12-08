using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;

namespace MonoxProperty.Middleware
{
    public class JwtLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);

                    Console.WriteLine("🔥 JWT Detected:");
                    Console.WriteLine("   Subject: " + jwt.Subject);
                    Console.WriteLine("   Expires: " + jwt.ValidTo);
                    Console.WriteLine("   Issuer : " + jwt.Issuer);
                }
                catch
                {
                    Console.WriteLine("⚠ Invalid JWT detected.");
                }
            }

            await _next(context);
        }
    }

    public static class JwtLoggingExtensions
    {
        public static IApplicationBuilder UseJwtLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtLoggingMiddleware>();
        }
    }
}
