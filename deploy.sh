#!/bin/bash

# ===========================================
# Script de Deploy - Finanças Cantinho
# ===========================================

set -e

echo "🚀 Iniciando deploy do Finanças Cantinho..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Por favor, não execute como root. Use seu usuário normal.${NC}"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker não encontrado. Instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose não encontrado. Instale o Docker Compose primeiro.${NC}"
    exit 1
fi

# Verificar arquivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}Arquivo .env não encontrado. Criando a partir do exemplo...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo .env com suas senhas antes de continuar!${NC}"
        echo -e "${YELLOW}   Use: nano .env${NC}"
        exit 1
    else
        echo -e "${RED}Arquivo .env.example não encontrado.${NC}"
        exit 1
    fi
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p certbot/conf certbot/www

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose down 2>/dev/null || true

# Construir imagens
echo "🔨 Construindo imagens Docker..."
docker compose build --no-cache

# Subir containers
echo "🚀 Iniciando containers..."
docker compose up -d

# Aguardar inicialização
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker compose ps

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "📌 Acesse a aplicação em:"
echo "   - http://$(hostname -I | awk '{print $1}')"
echo "   - http://seu-dominio.com (se configurado)"
echo ""
echo "📋 Comandos úteis:"
echo "   - Ver logs: docker compose logs -f"
echo "   - Parar: docker compose down"
echo "   - Reiniciar: docker compose restart"
echo ""
