using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Monokoane_Property.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIdColumnNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Properties",
                newName: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Properties",
                newName: "ID");
        }
    }
}
