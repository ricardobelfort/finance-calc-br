#!/bin/bash
# Finance Calc BR - Quick Start Script

echo "🚀 Finance Calc BR - Setup"
echo "=============================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado"
    echo "Instale de: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install
echo "✅ Dependências instaladas"
echo ""

# Build
echo "🔨 Fazendo build..."
npm run build
echo "✅ Build completo"
echo ""

# Próximos passos
echo "=============================="
echo "🎉 Setup completo!"
echo ""
echo "Próximas ações:"
echo ""
echo "1️⃣  Testar localmente:"
echo "   npm run dev"
echo "   Abrir: http://localhost:3000"
echo ""
echo "2️⃣  Fazer deploy no Vercel:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git push origin main"
echo "   # Depois conectar em https://vercel.com"
echo ""
echo "3️⃣  Editar conteúdo:"
echo "   Arquivos Markdown em: src/content/"
echo "   Styles em: src/assets/css/"
echo "   Scripts em: src/assets/js/"
echo ""
echo "📚 Documentação:"
echo "   - README.md (geral)"
echo "   - DEPLOYMENT.md (deploy)"
echo "   - EXTENDING.md (adicionar features)"
echo "   - STRUCTURE.md (arquitetura)"
echo ""
echo "=============================="
