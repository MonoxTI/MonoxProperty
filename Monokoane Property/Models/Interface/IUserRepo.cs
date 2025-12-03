using MonoxProperty.Entities;

namespace MonoxProperty.Interfaces
{
    public interface IUserRepo
    {
        Task<User?> GetByUsername(string username);
        Task<User> Create(User user);
    }
}
