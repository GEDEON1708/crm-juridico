# 🚀 Instruções de Deploy - Vercel (ATUALIZADO)

## ✅ Problema Resolvido

O erro **500: FUNCTION_INVOCATION_FAILED** foi corrigido! O backend agora está configurado como **Serverless Function**.

---

## 📋 Arquivos Criados/Modificados

### ✨ Novos Arquivos

1. **`backend/vercel.json`** - Configuração serverless da Vercel
2. **`backend/api/index.ts`** - Entry point para Serverless Function

### 🔧 Arquivos Modificados

1. **`backend/src/server.ts`** - Agora apenas para desenvolvimento local
2. **`backend/src/app.ts`** - Aplicação Express sem `listen()` (compatível serverless)

---

## 🎯 Passo a Passo para Deploy

### 1️⃣ Fazer Commit e Push das Alterações

```bash
cd c:\Users\Gedeon\Desktop\OCF\crm-juridico

# Adicionar arquivos
git add backend/vercel.json
git add backend/api/index.ts
git add backend/src/server.ts
git add backend/src/app.ts

# Commit
git commit -m "fix: configurar backend para Serverless Functions na Vercel"

# Push
git push origin main
```

---

### 2️⃣ Configurar Projeto na Vercel

#### Opção A: Redeploy do Projeto Existente

Se você já tem o projeto na Vercel:

1. Acesse https://vercel.com/dashboard
2. Encontre o projeto do backend
3. Vá em **Settings** → **General**
4. Verifique se **Root Directory** está como `backend`
5. Vá em **Deployments** → **Redeploy** (último deployment)

#### Opção B: Criar Novo Projeto

Se ainda não tem ou quer começar do zero:

1. Acesse https://vercel.com/new
2. Selecione o repositório: `GEDEON1708/crm-juridico`
3. Configure:

```
Project Name: crm-juridico-backend
Root Directory: backend
Framework Preset: Other
Build Command: npm run build
Output Directory: (deixar vazio)
Install Command: npm install
```

---

### 3️⃣ Configurar Variáveis de Ambiente

**IMPORTANTE:** Configure estas variáveis em **Settings** → **Environment Variables**:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database?schema=public
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_jwt_muito_segura_aqui
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.vercel.app
```

> **⚠️ ATENÇÃO:**
>
> - Substitua `DATABASE_URL` pela URL real do seu banco PostgreSQL (Neon, Supabase, Railway)
> - Gere chaves JWT seguras usando: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> - Atualize `CORS_ORIGIN` com a URL do seu frontend após deploy

---

### 4️⃣ Fazer Deploy

1. Clique em **Deploy**
2. Aguarde a build completar (2-3 minutos)
3. Copie a URL do backend (ex: `https://crm-juridico-backend.vercel.app`)

---

### 5️⃣ Testar o Backend

Após deploy, teste os endpoints:

```bash
# Health check
curl https://seu-backend.vercel.app/health

# Root
curl https://seu-backend.vercel.app/

# API Health
curl https://seu-backend.vercel.app/api/health
```

Resposta esperada:

```json
{
  "status": "OK",
  "timestamp": "2025-12-23T17:00:00.000Z"
}
```

---

### 6️⃣ Atualizar Frontend

No projeto do frontend na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Atualize ou adicione:

```env
VITE_API_URL=https://seu-backend.vercel.app/api
```

3. Faça **Redeploy** do frontend

---

## 🗄️ Banco de Dados

### Opções Recomendadas (Gratuitas)

#### Neon (Recomendado)

```
1. Acesse: https://neon.tech
2. Crie conta gratuita
3. Crie novo projeto PostgreSQL
4. Copie Connection String
5. Cole em DATABASE_URL na Vercel
```

#### Supabase

```
1. Acesse: https://supabase.com
2. Crie novo projeto
3. Settings → Database → Connection String
4. Use modo "Connection pooling"
5. Cole em DATABASE_URL na Vercel
```

#### Railway

```
1. Acesse: https://railway.app
2. New Project → Provision PostgreSQL
3. Copie DATABASE_URL
4. Cole na Vercel
```

---

## 🔍 Verificação Completa

### ✅ Checklist Backend

- [ ] Código commitado e pushed para GitHub
- [ ] Projeto criado/atualizado na Vercel
- [ ] Root Directory = `backend`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído sem erros
- [ ] `/health` retorna status OK
- [ ] `/api/health` retorna status OK

### ✅ Checklist Frontend

- [ ] VITE_API_URL atualizada com URL do backend
- [ ] Redeploy realizado
- [ ] Site carrega sem erros
- [ ] Login funciona
- [ ] Comunicação com API funciona

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

**Solução:** Verifique se `package.json` tem todas as dependências e faça redeploy.

### Erro: "DATABASE_URL is not defined"

**Solução:** Configure a variável `DATABASE_URL` nas Environment Variables da Vercel.

### Erro: CORS

**Solução:** Atualize `CORS_ORIGIN` com a URL correta do frontend.

### Erro: Prisma Schema

**Solução:** O script `vercel-build` no `package.json` já executa `prisma generate` e `prisma migrate deploy` automaticamente.

---

## 📝 Desenvolvimento Local

Para rodar localmente (não afetado pelas mudanças):

```bash
cd backend
npm install
npm run dev
```

O servidor continuará funcionando normalmente em `http://localhost:3001`

---

## 🎉 Resultado Final

Após seguir todos os passos:

- **Backend:** `https://crm-juridico-backend.vercel.app`
- **Frontend:** `https://crm-juridico-frontend.vercel.app`
- **Status:** ✅ Funcionando sem erros 500

---

**Desenvolvido por:** Gedeon  
**Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)
