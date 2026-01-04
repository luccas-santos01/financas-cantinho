using System.ComponentModel.DataAnnotations;

namespace FinancasCantinho.Models;

public class Categoria
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Nome { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Cor { get; set; } = "#6366f1"; // Cor padrão (indigo)
    
    [MaxLength(50)]
    public string Icone { get; set; } = "receipt"; // Ícone padrão
    
    public bool Ativo { get; set; } = true;
    
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();
}
