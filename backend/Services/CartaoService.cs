using Microsoft.EntityFrameworkCore;
using FinancasCantinho.Data;
using FinancasCantinho.Models;
using FinancasCantinho.Models.DTOs;

namespace FinancasCantinho.Services;

public interface ICartaoService
{
    Task<IEnumerable<CartaoDto>> GetAllAsync();
    Task<CartaoDto?> GetByIdAsync(int id);
    Task<CartaoDto> CreateAsync(CriarCartaoRequest request);
    Task<CartaoDto?> UpdateAsync(int id, AtualizarCartaoRequest request);
    Task<bool> DeleteAsync(int id);
}

public class CartaoService : ICartaoService
{
    private readonly AppDbContext _context;

    public CartaoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CartaoDto>> GetAllAsync()
    {
        return await _context.Cartoes
            .OrderBy(c => c.Nome)
            .Select(c => new CartaoDto(c.Id, c.Nome, c.Limite, c.Ativo))
            .ToListAsync();
    }

    public async Task<CartaoDto?> GetByIdAsync(int id)
    {
        var cartao = await _context.Cartoes.FindAsync(id);
        if (cartao == null) return null;

        return new CartaoDto(cartao.Id, cartao.Nome, cartao.Limite, cartao.Ativo);
    }

    public async Task<CartaoDto> CreateAsync(CriarCartaoRequest request)
    {
        var cartao = new Cartao
        {
            Nome = request.Nome,
            Limite = request.Limite
        };

        _context.Cartoes.Add(cartao);
        await _context.SaveChangesAsync();

        return new CartaoDto(cartao.Id, cartao.Nome, cartao.Limite, cartao.Ativo);
    }

    public async Task<CartaoDto?> UpdateAsync(int id, AtualizarCartaoRequest request)
    {
        var cartao = await _context.Cartoes.FindAsync(id);
        if (cartao == null) return null;

        cartao.Nome = request.Nome;
        cartao.Limite = request.Limite ?? cartao.Limite;
        cartao.Ativo = request.Ativo;

        await _context.SaveChangesAsync();

        return new CartaoDto(cartao.Id, cartao.Nome, cartao.Limite, cartao.Ativo);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var cartao = await _context.Cartoes.FindAsync(id);
        if (cartao == null) return false;

        // Soft delete: apenas desativa
        cartao.Ativo = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
