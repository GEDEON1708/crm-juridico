# Guia de Manutenção e Operação - CRM Jurídico

## Inicialização do Sistema

### Método Automático (Recomendado)
```powershell
# Na pasta raiz do projeto
.\start.ps1
```

Este script irá:
1. Parar processos Node.js existentes
2. Verificar se PostgreSQL está rodando
3. Iniciar backend na porta 3001
4. Iniciar frontend na porta 3000
5. Abrir navegador automaticamente

### Método Manual

**1. Iniciar Backend:**
```powershell
cd backend
npm run dev
```

**2. Iniciar Frontend (em outro terminal):**
```powershell
cd frontend
npm run dev
```

## Parar o Sistema

### Método Automático
```powershell
.\stop.ps1
```

### Método Manual
```powershell
# Parar todos os processos Node
taskkill /F /IM node.exe /T
```

## Verificação de Status

### Verificar Portas
```powershell
netstat -ano | findstr ":3000 :3001 :5433"
```

### Testar Backend
```powershell
curl http://localhost:3001/health -UseBasicParsing
```

### Testar Frontend
Abrir navegador em: http://localhost:3000

## Solução de Problemas Comuns

### Problema: "Porta já em uso"
**Solução:**
```powershell
# Parar todos os processos Node
.\stop.ps1

# Aguardar 2 segundos
Start-Sleep 2

# Iniciar novamente
.\start.ps1
```

### Problema: "Erro de conexão com banco de dados"
**Verificar PostgreSQL:**
```powershell
netstat -ano | findstr ":5433"
```

**Iniciar PostgreSQL:**
```powershell
docker-compose up -d
```

### Problema: "Frontend não carrega"
**Verificar se Vite está rodando:**
```powershell
netstat -ano | findstr ":3000"
```

**Limpar cache e reinstalar:**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

### Problema: "Erro ao fazer upload de arquivo"
**Verificar pasta uploads:**
```powershell
# Backend
cd backend
New-Item -ItemType Directory -Force -Path uploads/profiles
New-Item -ItemType Directory -Force -Path uploads/documents
```

### Problema: "Token expirado"
**Fazer logout e login novamente:**
- Clicar no botão "Sair" no sistema
- Fazer login novamente com as credenciais

## Manutenção do Banco de Dados

### Visualizar Banco (Prisma Studio)
```powershell
cd backend
npm run prisma:studio
```
Abrirá em: http://localhost:5555

### Aplicar Migrações
```powershell
cd backend
npm run prisma:migrate
```

### Resetar Banco (CUIDADO!)
```powershell
cd backend
npx prisma migrate reset
npm run prisma:seed
```

### Backup do Banco
```powershell
docker exec -t postgres_crm_juridico pg_dump -U crmjuridico crm_juridico > backup_$(Get-Date -Format "yyyy-MM-dd").sql
```

### Restaurar Backup
```powershell
docker exec -i postgres_crm_juridico psql -U crmjuridico crm_juridico < backup_2025-11-02.sql
```

## Logs e Debugging

### Ver Logs do Backend
Os logs estão no terminal onde o backend está rodando.

### Ver Logs do Frontend
Os logs estão no terminal onde o frontend está rodando.

### Logs do Navegador
1. Abrir DevTools (F12)
2. Aba "Console" para erros JavaScript
3. Aba "Network" para requisições HTTP

### Ativar Modo Debug
**Backend (.env):**
```env
NODE_ENV=development
```

**Frontend (console do navegador):**
```javascript
localStorage.setItem('debug', 'true')
```

## Atualizações e Deploy

### Atualizar Dependências
**Backend:**
```powershell
cd backend
npm update
```

**Frontend:**
```powershell
cd frontend
npm update
```

### Build para Produção

**Backend:**
```powershell
cd backend
npm run build
# Gera pasta dist/
```

**Frontend:**
```powershell
cd frontend
npm run build
# Gera pasta dist/
```

### Deploy em Produção
1. Configurar variáveis de ambiente (.env)
2. Build dos projetos
3. Configurar servidor (Nginx/Apache)
4. Configurar banco de dados remoto
5. Configurar SSL (Let's Encrypt)

## Credenciais Padrão

### Usuários de Teste
```
Sócio:
- Email: socio@exemplo.com
- Senha: senha123

Advogado:
- Email: advogado@exemplo.com
- Senha: senha123

Assistente:
- Email: assistente@exemplo.com
- Senha: senha123
```

### Banco de Dados
```
Host: localhost
Port: 5433
Database: crm_juridico
User: crmjuridico
Password: senha_super_segura_123
```

## Monitoramento

### Verificar Uso de Recursos
```powershell
# Processos Node
Get-Process node | Select-Object Id, CPU, WS

# Memória
Get-Process node | Measure-Object WS -Sum
```

### Verificar Espaço em Disco
```powershell
Get-PSDrive C | Select-Object Used,Free
```

### Verificar Tamanho de Uploads
```powershell
Get-ChildItem -Path "backend/uploads" -Recurse | Measure-Object -Property Length -Sum
```

## Segurança

### Alterar Senhas Padrão
Editar `backend/.env`:
```env
JWT_SECRET="sua_chave_secreta_aqui"
JWT_REFRESH_SECRET="sua_outra_chave_aqui"
```

### Configurar Email
Editar `backend/.env`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu_email@gmail.com"
SMTP_PASSWORD="sua_senha_de_app"
```

### Rate Limiting
Ajustar em `backend/.env`:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100  # 100 requisições
```

## Comandos Úteis

### Limpar Cache
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules/.cache

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules/.vite
```

### Verificar Versões
```powershell
node --version
npm --version
docker --version
```

### Reinstalar Tudo
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

## Contato e Suporte

**Desenvolvedor:** Okapi Code Forge  
**Website:** https://okapi-code-forge.vercel.app/

Para problemas ou dúvidas:
1. Verificar este guia primeiro
2. Verificar logs de erro
3. Tentar reiniciar o sistema
4. Contactar suporte técnico
