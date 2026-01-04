namespace FinancasCantinho.Models.DTOs;

// Auth DTOs
public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, DateTime Expiration);

// Categoria DTOs
public record CategoriaDto(int Id, string Nome, string Cor, string Icone, bool Ativo);
public record CriarCategoriaRequest(string Nome, string? Cor, string? Icone);
public record AtualizarCategoriaRequest(string Nome, string? Cor, string? Icone, bool Ativo);

// Cartao DTOs
public record CartaoDto(int Id, string Nome, decimal? Limite, bool Ativo);
public record CriarCartaoRequest(string Nome, decimal? Limite);
public record AtualizarCartaoRequest(string Nome, decimal? Limite, bool Ativo);

// Despesa DTOs
public record DespesaDto(
    int Id,
    string Descricao,
    decimal Valor,
    DateTime Data,
    string? Observacao,
    string? ComprovanteUrl,
    string? ComprovanteNome,
    int CategoriaId,
    string CategoriaNome,
    string CategoriaCor,
    int? CartaoId,
    string? CartaoNome,
    DateTime CriadoEm
);

public record CriarDespesaRequest(
    string Descricao,
    decimal Valor,
    DateTime Data,
    string? Observacao,
    int CategoriaId,
    int? CartaoId
);

public record AtualizarDespesaRequest(
    string Descricao,
    decimal Valor,
    DateTime Data,
    string? Observacao,
    int CategoriaId,
    int? CartaoId
);

public record DespesaFiltro(
    DateTime? DataInicio,
    DateTime? DataFim,
    int? CategoriaId,
    int? CartaoId,
    string? Busca,
    int Pagina = 1,
    int ItensPorPagina = 20
);

public record DespesasPaginadas(
    IEnumerable<DespesaDto> Items,
    int TotalItems,
    int PaginaAtual,
    int TotalPaginas
);

// Relatório DTOs
public record ResumoMensal(
    int Ano,
    int Mes,
    decimal Total,
    int QuantidadeDespesas,
    IEnumerable<GastoPorCategoria> PorCategoria
);

public record ResumoAnual(
    int Ano,
    decimal Total,
    int QuantidadeDespesas,
    IEnumerable<GastoMensal> PorMes,
    IEnumerable<GastoPorCategoria> PorCategoria
);

public record GastoPorCategoria(
    int CategoriaId,
    string CategoriaNome,
    string CategoriaCor,
    decimal Total,
    int Quantidade,
    decimal Percentual
);

public record GastoMensal(
    int Mes,
    string MesNome,
    decimal Total,
    int Quantidade
);

public record ComparativoMensal(
    int AnoAtual,
    int MesAtual,
    decimal TotalAtual,
    int AnoAnterior,
    int MesAnterior,
    decimal TotalAnterior,
    decimal Diferenca,
    decimal PercentualVariacao
);
