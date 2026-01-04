using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinancasCantinho.Models.DTOs;
using FinancasCantinho.Services;

namespace FinancasCantinho.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RelatoriosController : ControllerBase
{
    private readonly IRelatorioService _relatorioService;

    public RelatoriosController(IRelatorioService relatorioService)
    {
        _relatorioService = relatorioService;
    }

    [HttpGet("mensal/{ano}/{mes}")]
    public async Task<ActionResult<ResumoMensal>> GetResumoMensal(int ano, int mes)
    {
        if (mes < 1 || mes > 12)
            return BadRequest("Mês deve ser entre 1 e 12");

        var resumo = await _relatorioService.GetResumoMensalAsync(ano, mes);
        return Ok(resumo);
    }

    [HttpGet("anual/{ano}")]
    public async Task<ActionResult<ResumoAnual>> GetResumoAnual(int ano)
    {
        var resumo = await _relatorioService.GetResumoAnualAsync(ano);
        return Ok(resumo);
    }

    [HttpGet("comparativo/{ano}/{mes}")]
    public async Task<ActionResult<ComparativoMensal>> GetComparativo(int ano, int mes)
    {
        if (mes < 1 || mes > 12)
            return BadRequest("Mês deve ser entre 1 e 12");

        var comparativo = await _relatorioService.GetComparativoMensalAsync(ano, mes);
        return Ok(comparativo);
    }

    [HttpGet("evolucao/{ano}")]
    public async Task<ActionResult<IEnumerable<GastoMensal>>> GetEvolucaoAnual(int ano)
    {
        var evolucao = await _relatorioService.GetEvolucaoAnualAsync(ano);
        return Ok(evolucao);
    }
}
