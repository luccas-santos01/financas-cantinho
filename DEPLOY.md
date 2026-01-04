# 🚀 Deploy na VPS - Finanças Cantinho

Este guia explica como hospedar o aplicativo em `www.luccasdev.com.br/financas`.

## 📋 Arquitetura

Internet
    │
    ▼
┌─────────────────────────────────────────┐
│         NGINX PROXY (porta 80/443)      │
│         nginx-proxy container           │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌─────────┐               ┌───────────┐
│/financas│               │/outro-app │
│Frontend │               │ (futuro)  │
└────┬────┘               └───────────┘
     │
     ▼
┌─────────┐
│ Backend │
│ API     │
└────┬────┘
     │
     ▼
┌─────────┐
│SQL Server│
└──────────┘

```

## 🔧 Pré-requisitos na VPS

### 1. Instalar Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sudo sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

## 📤 Enviar projeto para VPS

**Opção A - Via Git (recomendado):**

```bash
cd /home/seu-usuario
git clone https://github.com/seu-usuario/financas-cantinho.git
cd financas-cantinho
```

**Opção B - Via SCP:**

```bash
# Do seu PC Windows (PowerShell)
scp -r "C:\Users\lucca\OneDrive\Documentos\vscode\financas-cantinho" usuario@IP:/home/usuario/
```

## ⚙️ Configuração

### 1. Configurar variáveis de ambiente

```bash
cd financas-cantinho
cp .env.example .env
nano .env
```

**IMPORTANTE:** Troque TODAS as senhas por valores seguros!

### 2. Fazer deploy

```bash
chmod +x deploy.sh setup-ssl.sh
./deploy.sh
```

### 3. Configurar SSL (HTTPS)

```bash
./setup-ssl.sh luccasdev.com.br
```

Depois:

1. Edite `nginx-proxy/nginx.conf`
2. Descomente o bloco HTTPS
3. `docker compose restart nginx-proxy`

## 🌐 Acessando

Após o deploy, acesse:

- **HTTP:** <http://luccasdev.com.br/financas>
- **HTTPS:** <https://luccasdev.com.br/financas> (após configurar SSL)

## 📌 Comandos Úteis

```bash
# Ver status dos containers
docker compose ps

# Ver logs
docker compose logs -f

# Reiniciar tudo
docker compose restart

# Parar tudo
docker compose down

# Rebuild após alterações
docker compose up -d --build

# Ver logs de um serviço específico
docker compose logs -f backend
```

## 🆕 Adicionar Outro Site

Para adicionar outro aplicativo em `/outro-app`:

1. Edite `nginx-proxy/nginx.conf` e adicione:

```nginx
location /outro-app {
    proxy_pass http://outro-container:80;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

1. Adicione o serviço no `docker-compose.yml`

2. Reinicie: `docker compose up -d`

## 🔒 Segurança

- ✅ Banco de dados não exposto externamente
- ✅ Backend não exposto externamente
- ✅ Senhas em variáveis de ambiente
- ✅ Suporte a HTTPS com Let's Encrypt

### Firewall recomendado

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```
