using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using MonoxProperty.Entities;

namespace MonoxProperty.Exceptions
{
    public class DuplicateEntityException : Exception
    {
        public DuplicateEntityException(string message) : base(message) { }
        public DuplicateEntityException(string entity, string value)
            : base($"A {entity} with the value '{value}' already exists.") { }
    }
}