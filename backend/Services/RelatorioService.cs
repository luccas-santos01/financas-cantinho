using Microsoft.EntityFrameworkCore;
using FinancasCantinho.Data;
using FinancasCantinho.Models.DTOs;
using System.Globalization;

namespace FinancasCantinho.Services;

public interface IRelatorioService
{
    Task<ResumoMensal> GetResumoMensalAsync(int ano, int mes);
    Task<ResumoAnual> GetResumoAnualAsync(int ano);
    Task<ComparativoMensal> GetComparativoMensalAsync(int ano, int mes);
    Task<IEnumerable<GastoMensal>> GetEvolucaoAnualAsync(int ano);
}

public class RelatorioService : IRelatorioService
{
    private readonly AppDbContext _context;
    private static readonly CultureInfo PtBr = new("pt-BR");

    public RelatorioService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ResumoMensal> GetResumoMensalAsync(int ano, int mes)
    {
        var despesas = await _context.Despesas
            .Include(d => d.Categoria)
            .Where(d => d.Data.Year == ano && d.Data.Month == mes)
            .ToListAsync();

        var total = despesas.Sum(d => d.Valor);
        var quantidade = despesas.Count;

        var porCategoria = despesas
            .GroupBy(d => new { d.CategoriaId, d.Categoria.Nome, d.Categoria.Cor })
            .Select(g => new GastoPorCategoria(
                g.Key.CategoriaId,
                g.Key.Nome,
                g.Key.Cor,
                g.Sum(d => d.Valor),
                g.Count(),
                total > 0 ? Math.Round(g.Sum(d => d.Valor) / total * 100, 2) : 0
            ))
            .OrderByDescending(g => g.Total)
            .ToList();

        return new ResumoMensal(ano, mes, total, quantidade, porCategoria);
    }

    public async Task<ResumoAnual> GetResumoAnualAsync(int ano)
    {
        var despesas = await _context.Despesas
            .Include(d => d.Categoria)
            .Where(d => d.Data.Year == ano)
            .ToListAsync();

        var total = despesas.Sum(d => d.Valor);
        var quantidade = despesas.Count;

        var porMes = Enumerable.Range(1, 12)
            .Select(m => new GastoMensal(
                m,
                PtBr.DateTimeFormat.GetMonthName(m),
                despesas.Where(d => d.Data.Month == m).Sum(d => d.Valor),
                despesas.Count(d => d.Data.Month == m)
            ))
            .ToList();

        var porCategoria = despesas
            .GroupBy(d => new { d.CategoriaId, d.Categoria.Nome, d.Categoria.Cor })
            .Select(g => new GastoPorCategoria(
                g.Key.CategoriaId,
                g.Key.Nome,
                g.Key.Cor,
                g.Sum(d => d.Valor),
                g.Count(),
                total > 0 ? Math.Round(g.Sum(d => d.Valor) / total * 100, 2) : 0
            ))
            .OrderByDescending(g => g.Total)
            .ToList();

        return new ResumoAnual(ano, total, quantidade, porMes, porCategoria);
    }

    public async Task<ComparativoMensal> GetComparativoMensalAsync(int ano, int mes)
    {
        // Mês atual
        var totalAtual = await _context.Despesas
            .Where(d => d.Data.Year == ano && d.Data.Month == mes)
            .SumAsync(d => d.Valor);

        // Mês anterior
        var mesAnterior = mes == 1 ? 12 : mes - 1;
        var anoAnterior = mes == 1 ? ano - 1 : ano;

        var totalAnterior = await _context.Despesas
            .Where(d => d.Data.Year == anoAnterior && d.Data.Month == mesAnterior)
            .SumAsync(d => d.Valor);

        var diferenca = totalAtual - totalAnterior;
        var percentualVariacao = totalAnterior > 0 
            ? Math.Round((diferenca / totalAnterior) * 100, 2) 
            : (totalAtual > 0 ? 100 : 0);

        return new ComparativoMensal(
            ano, mes, totalAtual,
            anoAnterior, mesAnterior, totalAnterior,
            diferenca, percentualVariacao
        );
    }

    public async Task<IEnumerable<GastoMensal>> GetEvolucaoAnualAsync(int ano)
    {
        var despesas = await _context.Despesas
            .Where(d => d.Data.Year == ano)
            .ToListAsync();

        return Enumerable.Range(1, 12)
            .Select(m => new GastoMensal(
                m,
                PtBr.DateTimeFormat.GetMonthName(m),
                despesas.Where(d => d.Data.Month == m).Sum(d => d.Valor),
                despesas.Count(d => d.Data.Month == m)
            ))
            .ToList();
    }
}
