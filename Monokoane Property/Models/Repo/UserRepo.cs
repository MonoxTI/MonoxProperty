using MonoxProperty.Entities;
using MonoxProperty.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MonoxProperty.Repository
{
    public class UserRepo : IUserRepo
    {
        private readonly ApplicationDB _context;

        public UserRepo(ApplicationDB context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            // Normalize email to lowercase for consistent lookup
            var normalizedEmail = email.ToLower().Trim();
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        }

        public async Task<User> CreateAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            // Ensure email is normalized before saving
            user.Email = user.Email?.ToLower().Trim() ?? string.Empty;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}