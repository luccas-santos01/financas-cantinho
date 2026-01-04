using System.ComponentModel.DataAnnotations;

namespace FinancasCantinho.Models;

public class Despesa
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Descricao { get; set; } = string.Empty;
    
    [Required]
    public decimal Valor { get; set; }
    
    [Required]
    public DateTime Data { get; set; }
    
    [MaxLength(500)]
    public string? Observacao { get; set; }
    
    public string? ComprovanteUrl { get; set; }
    
    public string? ComprovanteNome { get; set; }
    
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    
    public DateTime? AtualizadoEm { get; set; }
    
    // Foreign Key
    public int CategoriaId { get; set; }
    
    // Foreign Key opcional para Cartão
    public int? CartaoId { get; set; }

    // Navigation
    public Categoria Categoria { get; set; } = null!;

    // Navigation opcional para Cartão
    public Cartao? Cartao { get; set; }
}
