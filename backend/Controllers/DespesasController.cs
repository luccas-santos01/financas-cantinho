using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinancasCantinho.Models.DTOs;
using FinancasCantinho.Services;

namespace FinancasCantinho.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DespesasController : ControllerBase
{
    private readonly IDespesaService _despesaService;
    private readonly IWebHostEnvironment _environment;

    public DespesasController(IDespesaService despesaService, IWebHostEnvironment environment)
    {
        _despesaService = despesaService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<DespesasPaginadas>> GetAll(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] int? categoriaId,
        [FromQuery] int? cartaoId,
        [FromQuery] string? busca,
        [FromQuery] int pagina = 1,
        [FromQuery] int itensPorPagina = 20)
    {
        var filtro = new DespesaFiltro(dataInicio, dataFim, categoriaId, cartaoId, busca, pagina, itensPorPagina);
        var despesas = await _despesaService.GetAllAsync(filtro);
        return Ok(despesas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DespesaDto>> GetById(int id)
    {
        var despesa = await _despesaService.GetByIdAsync(id);
        if (despesa == null)
            return NotFound();

        return Ok(despesa);
    }

    [HttpPost]
    public async Task<ActionResult<DespesaDto>> Create([FromBody] CriarDespesaRequest request)
    {
        var despesa = await _despesaService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = despesa.Id }, despesa);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DespesaDto>> Update(int id, [FromBody] AtualizarDespesaRequest request)
    {
        var despesa = await _despesaService.UpdateAsync(id, request);
        if (despesa == null)
            return NotFound();

        return Ok(despesa);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _despesaService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/comprovante")]
    public async Task<ActionResult<DespesaDto>> UploadComprovante(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Arquivo não fornecido");

        // Validar tipo de arquivo
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "application/pdf" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest("Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou PDF");

        // Validar tamanho (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("Arquivo muito grande. Máximo: 5MB");

        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/{uniqueFileName}";
        var despesa = await _despesaService.AddComprovanteAsync(id, file.FileName, fileUrl);

        if (despesa == null)
        {
            // Remover arquivo se despesa não existe
            System.IO.File.Delete(filePath);
            return NotFound();
        }

        return Ok(despesa);
    }

    [HttpDelete("{id}/comprovante")]
    public async Task<IActionResult> RemoveComprovante(int id)
    {
        var despesa = await _despesaService.GetByIdAsync(id);
        if (despesa == null)
            return NotFound();

        if (!string.IsNullOrEmpty(despesa.ComprovanteUrl))
        {
            var filePath = Path.Combine(_environment.ContentRootPath, "wwwroot", despesa.ComprovanteUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        var result = await _despesaService.RemoveComprovanteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
