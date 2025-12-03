using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Interfaces;
using MonoxProperty.Services;
using MonoxProperty.Dtos;
using MonoxProperty.Entities;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;

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
            var existing = await _repo.GetByUsername(dto.Username);
            if (existing != null) return BadRequest("User already exists");

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = hashed
            };

            await _repo.Create(user);

            return Ok("User registered");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _repo.GetByUsername(dto.Username);
            if (user == null) return Unauthorized("Invalid credentials");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            var token = _jwt.GenerateToken(user);

            return Ok(new { token });
        }
    }
}
