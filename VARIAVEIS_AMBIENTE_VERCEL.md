# 🔐 Como Adicionar Variáveis de Ambiente na Vercel

## 📋 Método 1: Durante o Deploy (Primeira Vez)

### Passo 1: Ao criar o projeto
Quando você estiver configurando o deploy pela primeira vez, verá uma seção **"Environment Variables"**.

### Passo 2: Adicionar cada variável
Para cada variável, você precisa preencher:

**Key:** Nome da variável (em letras MAIÚSCULAS)  
**Value:** O valor da variável

---

## 🎯 Variáveis para o BACKEND

### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://usuario:senha@host:5432/database?schema=public
```
**Exemplo real com Neon:**
```
Value: postgresql://gedeon:AbCd1234@ep-cool-cloud-123456.us-east-1.aws.neon.tech/crmjuridico?sslmode=require
```

### 2. JWT_SECRET
```
Key: JWT_SECRET
Value: minha_chave_super_secreta_jwt_12345
```
**Dica:** Use uma string longa e aleatória. Exemplo:
```
Value: 8f9d2e1c4b5a6d3e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3
```

### 3. JWT_REFRESH_SECRET
```
Key: JWT_REFRESH_SECRET
Value: minha_chave_refresh_diferente_54321
```
**Dica:** Deve ser DIFERENTE do JWT_SECRET. Exemplo:
```
Value: 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7
```

### 4. NODE_ENV
```
Key: NODE_ENV
Value: production
```

### 5. PORT
```
Key: PORT
Value: 3001
```

### 6. CORS_ORIGIN
```
Key: CORS_ORIGIN
Value: https://crm-juridico-frontend.vercel.app
```
⚠️ **IMPORTANTE:** Depois que você fizer o deploy do frontend, volte aqui e coloque a URL real do frontend.

---

## 🎨 Variáveis para o FRONTEND

### 1. VITE_API_URL
```
Key: VITE_API_URL
Value: https://crm-juridico-backend.vercel.app/api
```
⚠️ **IMPORTANTE:** Use a URL do backend que você deployou primeiro + `/api` no final.

---

## 📝 Método 2: Adicionar DEPOIS do Deploy

Se você já fez o deploy e quer adicionar/editar variáveis:

### Passo 1: Acesse o Dashboard
1. Vá em <https://vercel.com/dashboard>
2. Clique no seu projeto

### Passo 2: Entre em Settings
1. Clique na aba **"Settings"** (no topo)
2. No menu lateral, clique em **"Environment Variables"**

### Passo 3: Adicionar Nova Variável
1. Você verá 3 campos:
   - **Key:** Digite o nome (ex: `DATABASE_URL`)
   - **Value:** Digite o valor (ex: `postgresql://...`)
   - **Environment:** Selecione onde usar:
     - ☑️ **Production** (obrigatório)
     - ☑️ **Preview** (opcional, mas recomendado)
     - ☑️ **Development** (opcional)

2. Clique em **"Save"**

### Passo 4: Redeploy (Importante!)
⚠️ **Depois de adicionar variáveis, você PRECISA fazer redeploy:**

1. Vá na aba **"Deployments"**
2. Clique nos 3 pontinhos **"..."** do último deploy
3. Clique em **"Redeploy"**
4. Confirme clicando em **"Redeploy"** novamente

---

## 🔍 Como Gerar Valores Seguros

### Para JWT_SECRET e JWT_REFRESH_SECRET

**Opção 1: Usando Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opção 2: Online (Gerador de Senhas)**
- Acesse: <https://passwordsgenerator.net/>
- Configure: 64 caracteres, com letras e números
- Copie e cole como valor

**Opção 3: PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

---

## ✅ Checklist Completo

### Backend - Environment Variables
- [ ] **DATABASE_URL** - URL do PostgreSQL (Neon/Supabase/Railway)
- [ ] **JWT_SECRET** - String aleatória de 64 caracteres
- [ ] **JWT_REFRESH_SECRET** - String aleatória DIFERENTE de 64 caracteres
- [ ] **NODE_ENV** - `production`
- [ ] **PORT** - `3001`
- [ ] **CORS_ORIGIN** - URL do frontend (adicionar depois do deploy do frontend)

### Frontend - Environment Variables
- [ ] **VITE_API_URL** - URL do backend + `/api` (ex: `https://crm-juridico-backend.vercel.app/api`)

---

## 🎬 Ordem de Deploy Recomendada

### 1️⃣ Deploy do Backend PRIMEIRO
- Configure todas as variáveis do backend
- EXCETO `CORS_ORIGIN` (pode deixar como `*` por enquanto)
- Copie a URL do backend após deploy

### 2️⃣ Deploy do Frontend
- Use a URL do backend na variável `VITE_API_URL`
- Copie a URL do frontend após deploy

### 3️⃣ Atualizar Backend
- Volte nas configurações do backend
- Adicione/Edite `CORS_ORIGIN` com a URL do frontend
- Faça **Redeploy** do backend

---

## 🐛 Erros Comuns

### Erro: "DATABASE_URL not found"
**Solução:** Verifique se você adicionou a variável `DATABASE_URL` e fez redeploy.

### Erro: "Cannot connect to database"
**Solução:** Verifique se a URL do banco está correta. Teste copiando a URL do Neon/Supabase novamente.

### Erro: "CORS blocked"
**Solução:** Atualize a variável `CORS_ORIGIN` no backend com a URL do frontend e faça redeploy.

### Frontend não conecta ao Backend
**Solução:** Verifique se `VITE_API_URL` está com a URL correta e tem `/api` no final.

---

## 📸 Exemplo Visual

```
╔════════════════════════════════════════════════════════╗
║  Environment Variables                                 ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Key:   DATABASE_URL                                  ║
║  Value: postgresql://user:pass@host:5432/db          ║
║  [✓] Production  [✓] Preview  [ ] Development         ║
║                                         [Save]         ║
║                                                        ║
║  ─────────────────────────────────────────────────   ║
║                                                        ║
║  Key:   JWT_SECRET                                    ║
║  Value: 8f9d2e1c4b5a6d3e7f0a1b2c3d4e5f6a             ║
║  [✓] Production  [✓] Preview  [ ] Development         ║
║                                         [Save]         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🎯 Resumo Rápido

| Variável | Backend | Frontend | Valor Exemplo |
|----------|---------|----------|---------------|
| `DATABASE_URL` | ✅ | ❌ | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | ✅ | ❌ | `8f9d2e1c4b5a6d3e7f0a...` (64 chars) |
| `JWT_REFRESH_SECRET` | ✅ | ❌ | `9a8b7c6d5e4f3a2b1c0d...` (64 chars) |
| `NODE_ENV` | ✅ | ❌ | `production` |
| `PORT` | ✅ | ❌ | `3001` |
| `CORS_ORIGIN` | ✅ | ❌ | `https://seu-frontend.vercel.app` |
| `VITE_API_URL` | ❌ | ✅ | `https://seu-backend.vercel.app/api` |

---

**Desenvolvido por:** Gedeon  
**Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)
