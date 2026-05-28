using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Monokoane_Property.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyParentChild : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "Properties",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Properties_ParentId",
                table: "Properties",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Properties_Properties_ParentId",
                table: "Properties",
                column: "ParentId",
                principalTable: "Properties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Properties_Properties_ParentId",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_ParentId",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "Properties");
        }
    }
}
