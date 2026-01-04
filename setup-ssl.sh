#!/bin/bash

# ===========================================
# Script para configurar SSL com Let's Encrypt
# ===========================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Domínio padrão
DOMAIN=${1:-"luccasdev.com.br"}
EMAIL=${2:-"admin@$DOMAIN"}

echo "🔒 Configurando SSL para: $DOMAIN"

# Criar diretórios
mkdir -p certbot/conf certbot/www

# Verificar se nginx está rodando
if ! docker compose ps | grep -q "nginx-proxy"; then
    echo -e "${RED}Nginx proxy não está rodando. Execute './deploy.sh' primeiro.${NC}"
    exit 1
fi

# Obter certificado
echo "📜 Obtendo certificado SSL..."
docker run -it --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado obtido com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}Próximos passos:${NC}"
    echo "1. Edite nginx-proxy/nginx.conf"
    echo "2. Descomente as configurações HTTPS"
    echo "3. Execute: docker compose restart nginx-proxy"
    echo ""
else
    echo -e "${RED}❌ Erro ao obter certificado.${NC}"
    exit 1
fi
