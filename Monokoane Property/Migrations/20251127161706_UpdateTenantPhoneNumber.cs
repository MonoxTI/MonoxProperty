using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Monokoane_Property.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTenantPhoneNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Tenants",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Leases",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "RentAmount",
                table: "Leases",
                newName: "Rent");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Expenses",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "Descriptioin",
                table: "Expenses",
                newName: "Description");

            migrationBuilder.AddColumn<decimal>(
                name: "Bond",
                table: "Leases",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Levy",
                table: "Leases",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bond",
                table: "Leases");

            migrationBuilder.DropColumn(
                name: "Levy",
                table: "Leases");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Tenants",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Leases",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "Rent",
                table: "Leases",
                newName: "RentAmount");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Expenses",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Expenses",
                newName: "Descriptioin");
        }
    }
}
