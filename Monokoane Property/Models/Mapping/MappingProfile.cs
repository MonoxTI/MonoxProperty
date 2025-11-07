using AutoMapper;
using MonoxProperty.Entities;
using MonoxProperty.Dtos;

public class MappingProfile : MappingProfile
{
    public MappingProfile()
    {
        CreateMap< Property, PropertyDto >().ReverseMap();
        CreateMap< Tenant, TenantDto >().ReverseMap();
        CreateMap< Lease, LeaseDto >().ReverseMap();
        CreateMap< Expenses, ExpenseDto >().ReverseMap();
    }
}