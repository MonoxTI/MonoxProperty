using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Interfaces;
using MonoxProperty.Services;
using MonoxProperty.Dtos;
using MonoxProperty.Entities;
using BCrypt.Net; // Make sure to import

namespace MonoxProperty.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepo _repo;
        private readonly JwtService _jwt;

        public AuthController(IUserRepo repo, JwtService jwt)
        {
            _repo = repo;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Validate model (optional but good)
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if email already exists
            var existingUser = await _repo.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest("Email is already registered.");

            // Hash password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create user (using Email and FullName from DTO)
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.Trim().ToLower(),
                PasswordHash = hashedPassword
            };

            await _repo.CreateAsync(user);

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // Find user by email
            var user = await _repo.GetByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized("Invalid email or password.");

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password.");

            // Generate JWT
            var token = _jwt.GenerateToken(user);

            return Ok(new { token });
        }
    }
}