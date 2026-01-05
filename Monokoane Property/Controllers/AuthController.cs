using Microsoft.AspNetCore.Mvc;
using MonoxProperty.Interfaces;
using MonoxProperty.Dtos;
using MonoxProperty.Services;

namespace MonoxProperty.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly JwtService _jwtService;

        // ✅ Inject AuthService instead of IUserRepo
        public AuthController(AuthService authService, JwtService jwtService)
        {
            _authService = authService;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _authService.RegisterAsync(dto);
                return Ok(new { message = "User registered successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var user = await _authService.LoginAsync(dto);
                var token = _jwtService.GenerateToken(user);
                return Ok(new { token });
            }
            catch (UnauthorizedAccessException)
            {
                // ✅ Generic error message (prevents email enumeration)
                return Unauthorized("Invalid email or password.");
            }
        }
    }
}