using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Monokoane_Property.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentsToLease : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LeaseId1",
                table: "Payments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_LeaseId1",
                table: "Payments",
                column: "LeaseId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Leases_LeaseId1",
                table: "Payments",
                column: "LeaseId1",
                principalTable: "Leases",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Leases_LeaseId1",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_LeaseId1",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "LeaseId1",
                table: "Payments");
        }
    }
}
