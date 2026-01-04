using System.ComponentModel.DataAnnotations;

namespace FinancasCantinho.Models;

public class Cartao
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    // Limite opcional do cartão
    public decimal? Limite { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();
}
