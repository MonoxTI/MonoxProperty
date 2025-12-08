using MonoxProperty.Dtos;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;

namespace MonoxProperty.Services
{
public class AuthService
{
    private readonly IUserRepo _userRepo;

    public AuthService(IUserRepo userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<User> RegisterAsync(RegisterDto dto)
    {
        // Check if email already exists
        if (await _userRepo.GetByEmailAsync(dto.Email) != null)
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        return await _userRepo.CreateAsync(user);
    }
    public async Task<User> LoginAsync(LoginDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email.Trim().ToLower());
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return user;
    }
}
}