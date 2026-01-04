using FinancasCantinho.Models;

namespace FinancasCantinho.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.Categorias.Any()) return;

        var categorias = new List<Categoria>
        {
            new() { Nome = "Alimentação", Cor = "#ef4444", Icone = "utensils" },
            new() { Nome = "Transporte", Cor = "#f97316", Icone = "car" },
            new() { Nome = "Moradia", Cor = "#eab308", Icone = "home" },
            new() { Nome = "Saúde", Cor = "#22c55e", Icone = "heart-pulse" },
            new() { Nome = "Educação", Cor = "#3b82f6", Icone = "graduation-cap" },
            new() { Nome = "Lazer", Cor = "#8b5cf6", Icone = "gamepad-2" },
            new() { Nome = "Vestuário", Cor = "#ec4899", Icone = "shirt" },
            new() { Nome = "Contas", Cor = "#06b6d4", Icone = "file-text" },
            new() { Nome = "Outros", Cor = "#6b7280", Icone = "more-horizontal" }
        };

        context.Categorias.AddRange(categorias);
        context.SaveChanges();
    }
}
