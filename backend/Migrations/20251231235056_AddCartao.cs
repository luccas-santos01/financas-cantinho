using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancasCantinho.Migrations
{
    /// <inheritdoc />
    public partial class AddCartao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CartaoId",
                table: "Despesas",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Cartoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Limite = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cartoes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Despesas_CartaoId",
                table: "Despesas",
                column: "CartaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Cartoes_Nome",
                table: "Cartoes",
                column: "Nome");

            migrationBuilder.AddForeignKey(
                name: "FK_Despesas_Cartoes_CartaoId",
                table: "Despesas",
                column: "CartaoId",
                principalTable: "Cartoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Despesas_Cartoes_CartaoId",
                table: "Despesas");

            migrationBuilder.DropTable(
                name: "Cartoes");

            migrationBuilder.DropIndex(
                name: "IX_Despesas_CartaoId",
                table: "Despesas");

            migrationBuilder.DropColumn(
                name: "CartaoId",
                table: "Despesas");
        }
    }
}
