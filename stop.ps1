# Script para parar o CRM Juridico

Write-Host "========================================" -ForegroundColor Red
Write-Host "   CRM Juridico - Parando Sistema" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "[STOP] Parando todos os processos Node.js..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null

Start-Sleep -Seconds 2

Write-Host "[OK] Sistema parado com sucesso!" -ForegroundColor Green
Write-Host ""
