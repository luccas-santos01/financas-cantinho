using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using FinancasCantinho.Models.DTOs;

namespace FinancasCantinho.Services;

public interface IAuthService
{
    LoginResponse? Authenticate(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public LoginResponse? Authenticate(LoginRequest request)
    {
        var adminUsername = _configuration["AdminSettings:Username"] ?? "admin";
        var adminPassword = _configuration["AdminSettings:Password"] ?? "admin123";

        if (request.Username != adminUsername || request.Password != adminPassword)
        {
            return null;
        }

        var token = GenerateJwtToken(request.Username);
        var expirationHours = int.Parse(_configuration["JwtSettings:ExpirationInHours"] ?? "24");
        
        return new LoginResponse(token, DateTime.UtcNow.AddHours(expirationHours));
    }

    private string GenerateJwtToken(string username)
    {
        var secret = _configuration["JwtSettings:Secret"] ?? "DefaultSecretKey12345678901234567890";
        var issuer = _configuration["JwtSettings:Issuer"] ?? "FinancasCantinho";
        var audience = _configuration["JwtSettings:Audience"] ?? "FinancasCantinhoUsers";
        var expirationHours = int.Parse(_configuration["JwtSettings:ExpirationInHours"] ?? "24");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
