using MonoxProperty.Dtos;
using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using System;

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
            // Input validation
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("Email is required.", nameof(dto.Email));
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new ArgumentException("Full name is required.", nameof(dto.FullName));
            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("Password is required.", nameof(dto.Password));
            if (dto.Password.Length < 6)
                throw new ArgumentException("Password must be at least 6 characters.", nameof(dto.Password));

            var email = dto.Email.Trim().ToLower();
            
            // Check if email already exists
            if (await _userRepo.GetByEmailAsync(email) != null)
                throw new InvalidOperationException("Email already registered.");

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            return await _userRepo.CreateAsync(user);
        }

        public async Task<User> LoginAsync(LoginDto dto)
        {
            // Input validation
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("Email is required.", nameof(dto.Email));
            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("Password is required.", nameof(dto.Password));

            var email = dto.Email.Trim().ToLower(); 
            var user = await _userRepo.GetByEmailAsync(email);
            
            // Prevent timing attacks
            if (user == null)
            {
                // Verify dummy hash to maintain consistent timing
                BCrypt.Net.BCrypt.Verify(dto.Password, BCrypt.Net.BCrypt.HashPassword("dummy"));
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            return user;
        }
    }
}