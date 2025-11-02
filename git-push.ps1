# Script de Envio para GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Preparacao para GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git esta instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Git nao encontrado!" -ForegroundColor Red
    Write-Host "       Instale o Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Git encontrado:" -ForegroundColor Green
git --version
Write-Host ""

# Verificar configuracao do Git
$gitUser = git config --global user.name
$gitEmail = git config --global user.email

if (-not $gitUser -or -not $gitEmail) {
    Write-Host "[AVISO] Git nao configurado!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Configure seu Git com:" -ForegroundColor Cyan
    Write-Host '  git config --global user.name "Seu Nome"' -ForegroundColor White
    Write-Host '  git config --global user.email "seu.email@example.com"' -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Deseja continuar assim mesmo? (s/n)"
    if ($continue -ne "s") {
        exit 0
    }
} else {
    Write-Host "[OK] Git configurado:" -ForegroundColor Green
    Write-Host "     Nome:  $gitUser" -ForegroundColor White
    Write-Host "     Email: $gitEmail" -ForegroundColor White
}

Write-Host ""

# Verificar se ja e um repositorio Git
if (Test-Path ".git") {
    Write-Host "[AVISO] Ja e um repositorio Git" -ForegroundColor Yellow
    $reinit = Read-Host "Deseja reinicializar? (s/n)"
    if ($reinit -eq "s") {
        Remove-Item -Recurse -Force .git
        git init
        Write-Host "[OK] Repositorio reinicializado" -ForegroundColor Green
    }
} else {
    Write-Host "[INIT] Inicializando repositorio Git..." -ForegroundColor Cyan
    git init
    Write-Host "[OK] Repositorio inicializado" -ForegroundColor Green
}

Write-Host ""

# Adicionar arquivos
Write-Host "[ADD] Adicionando arquivos..." -ForegroundColor Cyan
git add .

$status = git status --short
if ($status) {
    Write-Host "[OK] Arquivos adicionados:" -ForegroundColor Green
    git status --short | ForEach-Object { Write-Host "     $_" -ForegroundColor White }
} else {
    Write-Host "[AVISO] Nenhum arquivo para adicionar" -ForegroundColor Yellow
}

Write-Host ""

# Fazer commit
Write-Host "[COMMIT] Fazendo commit inicial..." -ForegroundColor Cyan
git commit -m "feat: implementacao inicial do CRM Juridico

- Sistema completo de gestao para escritorios de advocacia
- Backend em Node.js + TypeScript + Express + Prisma
- Frontend em React + TypeScript + Vite + Tailwind
- Autenticacao JWT com controle de acesso
- Dashboard com estatisticas e graficos
- Gestao de clientes, casos, prazos e documentos
- Sistema de notificacoes em tempo real
- Upload de arquivos e fotos de perfil
- Documentacao completa
- Scripts de automacao para Windows

Desenvolvido por: Gedeon
Website: https://okapi-code-forge.vercel.app/"

Write-Host "[OK] Commit realizado" -ForegroundColor Green
Write-Host ""

# Solicitar URL do repositorio remoto
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Configuracao do Remoto" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Crie um repositorio no GitHub:" -ForegroundColor Yellow
Write-Host "  1. Acesse: https://github.com/new" -ForegroundColor White
Write-Host "  2. Nome: crm-juridico" -ForegroundColor White
Write-Host "  3. NAO marque 'Initialize with README'" -ForegroundColor White
Write-Host "  4. Clique em 'Create repository'" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Cole a URL do repositorio (ex: https://github.com/usuario/crm-juridico.git)"

if (-not $repoUrl) {
    Write-Host "[ERRO] URL nao fornecida" -ForegroundColor Red
    exit 1
}

# Adicionar remote
Write-Host ""
Write-Host "[REMOTE] Configurando repositorio remoto..." -ForegroundColor Cyan

# Remover remote antigo se existir
git remote remove origin 2>$null

git remote add origin $repoUrl
Write-Host "[OK] Remote configurado" -ForegroundColor Green
Write-Host ""

# Renomear branch para main
Write-Host "[BRANCH] Configurando branch principal..." -ForegroundColor Cyan
git branch -M main
Write-Host "[OK] Branch 'main' configurada" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Enviando para GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[PUSH] Enviando arquivos..." -ForegroundColor Cyan
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   Sucesso!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repositorio enviado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo passos:" -ForegroundColor Cyan
    Write-Host "  1. Configure a descricao do repositorio" -ForegroundColor White
    Write-Host "  2. Adicione topics (tags)" -ForegroundColor White
    Write-Host "  3. Configure GitHub Pages para docs" -ForegroundColor White
    Write-Host "  4. Habilite Issues e Projects" -ForegroundColor White
    Write-Host ""
    Write-Host "Para deploy no Vercel:" -ForegroundColor Cyan
    Write-Host "  1. Acesse: https://vercel.com" -ForegroundColor White
    Write-Host "  2. Import seu repositorio" -ForegroundColor White
    Write-Host "  3. Configure variaveis de ambiente" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "[ERRO] Falha no push" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "  1. Verifique suas credenciais do GitHub" -ForegroundColor White
    Write-Host "  2. Use Personal Access Token se necessario" -ForegroundColor White
    Write-Host "  3. Verifique a URL do repositorio" -ForegroundColor White
    exit 1
}
