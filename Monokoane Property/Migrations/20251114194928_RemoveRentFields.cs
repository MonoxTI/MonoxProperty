using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Monokoane_Property.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bond",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "Levy",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "Rent",
                table: "Properties");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Bond",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Levy",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Rent",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
