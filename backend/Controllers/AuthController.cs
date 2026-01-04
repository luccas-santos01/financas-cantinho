using Microsoft.AspNetCore.Mvc;
using FinancasCantinho.Models.DTOs;
using FinancasCantinho.Services;

namespace FinancasCantinho.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var result = _authService.Authenticate(request);
        
        if (result == null)
        {
            return Unauthorized(new { message = "Usuário ou senha inválidos" });
        }

        return Ok(result);
    }
}
