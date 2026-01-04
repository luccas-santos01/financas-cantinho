# Finanças Cantinho 🏠💰

Sistema de controle de despesas domésticas com interface moderna e responsiva.

## 🚀 Tecnologias

- **Backend:** .NET 8, Entity Framework Core, JWT Authentication
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Recharts
- **Banco de Dados:** SQL Server 2022
- **Infraestrutura:** Docker, Docker Compose

## 📋 Funcionalidades

- ✅ Login com autenticação JWT
- ✅ CRUD completo de despesas
- ✅ Categorias personalizáveis
- ✅ Upload de comprovantes (fotos/PDFs)
- ✅ Relatórios mensais e anuais
- ✅ Gráficos interativos
- ✅ Comparativo entre períodos
- ✅ Interface mobile-first com dark mode

## 🐳 Rodando com Docker

### Pré-requisitos

- Docker Desktop instalado
- Docker Compose

### Iniciando a aplicação

```bash
# Clone o repositório ou acesse a pasta do projeto
cd financas-cantinho

# Suba os containers
docker-compose up -d --build

# Aguarde os containers iniciarem (pode levar alguns minutos na primeira vez)
docker-compose logs -f
```

### Acessando

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000
- **Swagger:** http://localhost:5000/swagger

### Credenciais padrão

- **Usuário:** admin
- **Senha:** admin123

> ⚠️ **Importante:** Altere as credenciais no arquivo `docker-compose.yml` antes de usar em produção!

### Parando os containers

```bash
docker-compose down

# Para remover também os volumes (banco de dados):
docker-compose down -v
```

## ⚙️ Configuração

### Variáveis de ambiente (docker-compose.yml)

```yaml
# Credenciais do admin
AdminSettings__Username: admin
AdminSettings__Password: admin123

# JWT
JwtSettings__Secret: SuaChaveSecretaMuitoLonga123456789012345678901234567890

# SQL Server
MSSQL_SA_PASSWORD: SuaSenhaForte@123
```

## 🛠️ Desenvolvimento Local

### Backend

```bash
cd backend
dotnet restore
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📱 Screenshots

A interface foi projetada para funcionar perfeitamente em dispositivos móveis e desktop, com:

- Navegação inferior em mobile
- Sidebar em desktop
- Design minimalista com dark mode
- Gráficos responsivos

## 📊 Estrutura do Projeto

```
financas-cantinho/
├── docker-compose.yml
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Data/
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── contexts/
    │   └── types/
    ├── Dockerfile
    └── nginx.conf
```

## 📄 Licença

Este projeto é de uso pessoal/familiar.
