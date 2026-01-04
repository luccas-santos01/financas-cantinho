using Microsoft.EntityFrameworkCore;
using FinancasCantinho.Models;

namespace FinancasCantinho.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Despesa> Despesas => Set<Despesa>();
    public DbSet<Cartao> Cartoes => Set<Cartao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Categoria
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Cor).HasMaxLength(50);
            entity.Property(e => e.Icone).HasMaxLength(50);
            entity.HasIndex(e => e.Nome).IsUnique();
        });

        // Despesa
        modelBuilder.Entity<Despesa>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Descricao).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Valor).HasColumnType("numeric(18,2)");
            entity.Property(e => e.Observacao).HasMaxLength(500);
            
            entity.HasOne(e => e.Categoria)
                  .WithMany(c => c.Despesas)
                  .HasForeignKey(e => e.CategoriaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Cartao)
                .WithMany(c => c.Despesas)
                .HasForeignKey(e => e.CartaoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.Data);
            entity.HasIndex(e => e.CategoriaId);
            entity.HasIndex(e => e.CartaoId);
        });

        // Cartao
        modelBuilder.Entity<Cartao>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Limite).HasColumnType("numeric(18,2)");
            entity.Property(e => e.CriadoEm);
            entity.HasIndex(e => e.Nome).IsUnique(false);
        });
    }
}
