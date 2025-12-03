using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{
    public interface IUserRepo
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User> CreateAsync(User user);
    }
}