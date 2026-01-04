using Microsoft.EntityFrameworkCore;
using FinancasCantinho.Data;
using FinancasCantinho.Models;
using FinancasCantinho.Models.DTOs;

namespace FinancasCantinho.Services;

public interface IDespesaService
{
    Task<DespesasPaginadas> GetAllAsync(DespesaFiltro filtro);
    Task<DespesaDto?> GetByIdAsync(int id);
    Task<DespesaDto> CreateAsync(CriarDespesaRequest request);
    Task<DespesaDto?> UpdateAsync(int id, AtualizarDespesaRequest request);
    Task<bool> DeleteAsync(int id);
    Task<DespesaDto?> AddComprovanteAsync(int id, string fileName, string fileUrl);
    Task<bool> RemoveComprovanteAsync(int id);
}

public class DespesaService : IDespesaService
{
    private readonly AppDbContext _context;

    public DespesaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DespesasPaginadas> GetAllAsync(DespesaFiltro filtro)
    {
        var query = _context.Despesas
            .Include(d => d.Categoria)
            .Include(d => d.Cartao)
            .AsQueryable();

        // Filtros
        if (filtro.DataInicio.HasValue)
            query = query.Where(d => d.Data >= filtro.DataInicio.Value);

        if (filtro.DataFim.HasValue)
            query = query.Where(d => d.Data <= filtro.DataFim.Value);

        if (filtro.CategoriaId.HasValue)
            query = query.Where(d => d.CategoriaId == filtro.CategoriaId.Value);

        if (filtro.CartaoId.HasValue)
            query = query.Where(d => d.CartaoId == filtro.CartaoId.Value);

        if (!string.IsNullOrWhiteSpace(filtro.Busca))
            query = query.Where(d => d.Descricao.Contains(filtro.Busca) || 
                                     (d.Observacao != null && d.Observacao.Contains(filtro.Busca)));

        var totalItems = await query.CountAsync();
        var totalPaginas = (int)Math.Ceiling(totalItems / (double)filtro.ItensPorPagina);

        var items = await query
            .OrderByDescending(d => d.Data)
            .ThenByDescending(d => d.CriadoEm)
            .Skip((filtro.Pagina - 1) * filtro.ItensPorPagina)
            .Take(filtro.ItensPorPagina)
            .Select(d => new DespesaDto(
                d.Id,
                d.Descricao,
                d.Valor,
                d.Data,
                d.Observacao,
                d.ComprovanteUrl,
                d.ComprovanteNome,
                d.CategoriaId,
                d.Categoria.Nome,
                d.Categoria.Cor,
                d.CartaoId,
                d.Cartao != null ? d.Cartao.Nome : null,
                d.CriadoEm
            ))
            .ToListAsync();

        return new DespesasPaginadas(items, totalItems, filtro.Pagina, totalPaginas);
    }

    public async Task<DespesaDto?> GetByIdAsync(int id)
    {
        var despesa = await _context.Despesas
            .Include(d => d.Categoria)
            .Include(d => d.Cartao)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (despesa == null) return null;

        return new DespesaDto(
            despesa.Id,
            despesa.Descricao,
            despesa.Valor,
            despesa.Data,
            despesa.Observacao,
            despesa.ComprovanteUrl,
            despesa.ComprovanteNome,
            despesa.CategoriaId,
            despesa.Categoria.Nome,
            despesa.Categoria.Cor,
            despesa.CartaoId,
            despesa.Cartao != null ? despesa.Cartao.Nome : null,
            despesa.CriadoEm
        );
    }

    public async Task<DespesaDto> CreateAsync(CriarDespesaRequest request)
    {
        var despesa = new Despesa
        {
            Descricao = request.Descricao,
            Valor = request.Valor,
            Data = request.Data,
            Observacao = request.Observacao,
            CategoriaId = request.CategoriaId,
            CartaoId = request.CartaoId
        };

        _context.Despesas.Add(despesa);
        await _context.SaveChangesAsync();

        // Reload with categoria and cartao
        await _context.Entry(despesa).Reference(d => d.Categoria).LoadAsync();
        await _context.Entry(despesa).Reference(d => d.Cartao).LoadAsync();

        return new DespesaDto(
            despesa.Id,
            despesa.Descricao,
            despesa.Valor,
            despesa.Data,
            despesa.Observacao,
            despesa.ComprovanteUrl,
            despesa.ComprovanteNome,
            despesa.CategoriaId,
            despesa.Categoria.Nome,
            despesa.Categoria.Cor,
            despesa.CartaoId,
            despesa.Cartao != null ? despesa.Cartao.Nome : null,
            despesa.CriadoEm
        );
    }

    public async Task<DespesaDto?> UpdateAsync(int id, AtualizarDespesaRequest request)
    {
        var despesa = await _context.Despesas
            .Include(d => d.Categoria)
            .Include(d => d.Cartao)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (despesa == null) return null;

        despesa.Descricao = request.Descricao;
        despesa.Valor = request.Valor;
        despesa.Data = request.Data;
        despesa.Observacao = request.Observacao;
        despesa.CategoriaId = request.CategoriaId;
        despesa.AtualizadoEm = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload categoria and cartao if changed
        await _context.Entry(despesa).Reference(d => d.Categoria).LoadAsync();
        await _context.Entry(despesa).Reference(d => d.Cartao).LoadAsync();

        return new DespesaDto(
            despesa.Id,
            despesa.Descricao,
            despesa.Valor,
            despesa.Data,
            despesa.Observacao,
            despesa.ComprovanteUrl,
            despesa.ComprovanteNome,
            despesa.CategoriaId,
            despesa.Categoria.Nome,
            despesa.Categoria.Cor,
            despesa.CartaoId,
            despesa.Cartao != null ? despesa.Cartao.Nome : null,
            despesa.CriadoEm
        );
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var despesa = await _context.Despesas.FindAsync(id);
        if (despesa == null) return false;

        _context.Despesas.Remove(despesa);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<DespesaDto?> AddComprovanteAsync(int id, string fileName, string fileUrl)
    {
        var despesa = await _context.Despesas
            .Include(d => d.Categoria)
            .Include(d => d.Cartao)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (despesa == null) return null;

        despesa.ComprovanteNome = fileName;
        despesa.ComprovanteUrl = fileUrl;
        despesa.AtualizadoEm = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new DespesaDto(
            despesa.Id,
            despesa.Descricao,
            despesa.Valor,
            despesa.Data,
            despesa.Observacao,
            despesa.ComprovanteUrl,
            despesa.ComprovanteNome,
            despesa.CategoriaId,
            despesa.Categoria.Nome,
            despesa.Categoria.Cor,
            despesa.CartaoId,
            despesa.Cartao != null ? despesa.Cartao.Nome : null,
            despesa.CriadoEm
        );
    }

    public async Task<bool> RemoveComprovanteAsync(int id)
    {
        var despesa = await _context.Despesas.FindAsync(id);
        if (despesa == null) return false;

        despesa.ComprovanteNome = null;
        despesa.ComprovanteUrl = null;
        despesa.AtualizadoEm = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
}
