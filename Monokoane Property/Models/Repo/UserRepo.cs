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
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<User> CreateAsync(User user)
        {
            // Assume password is already hashed by the service layer
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}