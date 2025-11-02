# Script de inicializacao do CRM Juridico
# Executa backend e frontend com tratamento de erros

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CRM Juridico - Inicializacao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funcao para verificar se uma porta esta em uso
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# Funcao para matar processos Node.js
function Stop-NodeProcesses {
    Write-Host "[STOP] Parando processos Node.js existentes..." -ForegroundColor Yellow
    taskkill /F /IM node.exe /T 2>$null | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "[OK] Processos finalizados" -ForegroundColor Green
    Write-Host ""
}

# Parar processos existentes
Stop-NodeProcesses

# Verificar PostgreSQL
Write-Host "[CHECK] Verificando PostgreSQL na porta 5433..." -ForegroundColor Cyan
if (Test-Port 5433) {
    Write-Host "[OK] PostgreSQL esta rodando" -ForegroundColor Green
} else {
    Write-Host "[ERRO] PostgreSQL nao esta rodando na porta 5433!" -ForegroundColor Red
    Write-Host "       Execute 'docker-compose up -d' para iniciar o banco" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Iniciar Backend
Write-Host "[START] Iniciando Backend - porta 3001..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "[ERRO] Pasta backend nao encontrada!" -ForegroundColor Red
    exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend - CRM Juridico' -ForegroundColor Green; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

# Verificar se backend iniciou
if (Test-Port 3001) {
    Write-Host "[OK] Backend iniciado na porta 3001" -ForegroundColor Green
} else {
    Write-Host "[WAIT] Backend esta iniciando... aguarde" -ForegroundColor Yellow
}
Write-Host ""

# Iniciar Frontend
Write-Host "[START] Iniciando Frontend - porta 3000..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERRO] Pasta frontend nao encontrada!" -ForegroundColor Red
    exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend - CRM Juridico' -ForegroundColor Blue; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 7

# Verificar se frontend iniciou
if (Test-Port 3000) {
    Write-Host "[OK] Frontend iniciado na porta 3000" -ForegroundColor Green
} else {
    Write-Host "[WAIT] Frontend esta iniciando... aguarde" -ForegroundColor Yellow
}
Write-Host ""

# Status final
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Sistema Iniciado com Sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Credenciais de teste:" -ForegroundColor Cyan
Write-Host "   Email:    socio@exemplo.com" -ForegroundColor White
Write-Host "   Senha:    senha123" -ForegroundColor White
Write-Host ""
Write-Host "Para parar: Execute './stop.ps1'" -ForegroundColor Yellow
Write-Host ""

# Abrir navegador
Start-Sleep -Seconds 3
Write-Host "[BROWSER] Abrindo navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"
