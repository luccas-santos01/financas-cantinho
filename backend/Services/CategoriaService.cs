using Microsoft.EntityFrameworkCore;
using FinancasCantinho.Data;
using FinancasCantinho.Models;
using FinancasCantinho.Models.DTOs;

namespace FinancasCantinho.Services;

public interface ICategoriaService
{
    Task<IEnumerable<CategoriaDto>> GetAllAsync();
    Task<CategoriaDto?> GetByIdAsync(int id);
    Task<CategoriaDto> CreateAsync(CriarCategoriaRequest request);
    Task<CategoriaDto?> UpdateAsync(int id, AtualizarCategoriaRequest request);
    Task<bool> DeleteAsync(int id);
}

public class CategoriaService : ICategoriaService
{
    private readonly AppDbContext _context;

    public CategoriaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoriaDto>> GetAllAsync()
    {
        return await _context.Categorias
            .OrderBy(c => c.Nome)
            .Select(c => new CategoriaDto(c.Id, c.Nome, c.Cor, c.Icone, c.Ativo))
            .ToListAsync();
    }

    public async Task<CategoriaDto?> GetByIdAsync(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null) return null;
        
        return new CategoriaDto(categoria.Id, categoria.Nome, categoria.Cor, categoria.Icone, categoria.Ativo);
    }

    public async Task<CategoriaDto> CreateAsync(CriarCategoriaRequest request)
    {
        var categoria = new Categoria
        {
            Nome = request.Nome,
            Cor = request.Cor ?? "#6366f1",
            Icone = request.Icone ?? "receipt"
        };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return new CategoriaDto(categoria.Id, categoria.Nome, categoria.Cor, categoria.Icone, categoria.Ativo);
    }

    public async Task<CategoriaDto?> UpdateAsync(int id, AtualizarCategoriaRequest request)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null) return null;

        categoria.Nome = request.Nome;
        categoria.Cor = request.Cor ?? categoria.Cor;
        categoria.Icone = request.Icone ?? categoria.Icone;
        categoria.Ativo = request.Ativo;

        await _context.SaveChangesAsync();

        return new CategoriaDto(categoria.Id, categoria.Nome, categoria.Cor, categoria.Icone, categoria.Ativo);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null) return false;

        // Soft delete - apenas desativa
        categoria.Ativo = false;
        await _context.SaveChangesAsync();
        
        return true;
    }
}
