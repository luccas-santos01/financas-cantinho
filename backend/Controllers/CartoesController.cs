using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinancasCantinho.Models.DTOs;
using FinancasCantinho.Services;

namespace FinancasCantinho.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartoesController : ControllerBase
{
    private readonly ICartaoService _cartaoService;

    public CartoesController(ICartaoService cartaoService)
    {
        _cartaoService = cartaoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CartaoDto>>> GetAll()
    {
        var cartoes = await _cartaoService.GetAllAsync();
        return Ok(cartoes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CartaoDto>> GetById(int id)
    {
        var cartao = await _cartaoService.GetByIdAsync(id);
        if (cartao == null) return NotFound();
        return Ok(cartao);
    }

    [HttpPost]
    public async Task<ActionResult<CartaoDto>> Create([FromBody] CriarCartaoRequest request)
    {
        var cartao = await _cartaoService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = cartao.Id }, cartao);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CartaoDto>> Update(int id, [FromBody] AtualizarCartaoRequest request)
    {
        var cartao = await _cartaoService.UpdateAsync(id, request);
        if (cartao == null) return NotFound();
        return Ok(cartao);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _cartaoService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
