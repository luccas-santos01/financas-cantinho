using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinancasCantinho.Models.DTOs;
using FinancasCantinho.Services;

namespace FinancasCantinho.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly ICategoriaService _categoriaService;

    public CategoriasController(ICategoriaService categoriaService)
    {
        _categoriaService = categoriaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetAll()
    {
        var categorias = await _categoriaService.GetAllAsync();
        return Ok(categorias);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoriaDto>> GetById(int id)
    {
        var categoria = await _categoriaService.GetByIdAsync(id);
        if (categoria == null)
            return NotFound();

        return Ok(categoria);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> Create([FromBody] CriarCategoriaRequest request)
    {
        var categoria = await _categoriaService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, categoria);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoriaDto>> Update(int id, [FromBody] AtualizarCategoriaRequest request)
    {
        var categoria = await _categoriaService.UpdateAsync(id, request);
        if (categoria == null)
            return NotFound();

        return Ok(categoria);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _categoriaService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
