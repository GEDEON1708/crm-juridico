# 🚀 Guia de Deploy - Vercel

## ⚠️ Problema Identificado

**Erro:** `404: NOT_FOUND`

**Causa:** O projeto é um monorepo (backend + frontend), mas o deploy foi feito sem especificar corretamente qual parte deployar.

---

## ✅ Solução: Deploy Separado

### 📋 Pré-requisitos

1. Projeto no GitHub: `https://github.com/GEDEON1708/crm-juridico`
2. Conta Vercel conectada ao GitHub
3. Banco de dados PostgreSQL (Neon, Supabase, ou Railway)

---

## 🎯 PASSO 1: Deploy do Backend (API)

### 1.1 Criar Novo Projeto na Vercel

1. Acesse https://vercel.com/new
2. Selecione o repositório: `GEDEON1708/crm-juridico`
3. **Configure assim:**

```
Project Name: crm-juridico-backend
Root Directory: backend
Framework Preset: Other
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 1.2 Variáveis de Ambiente (Backend)

Adicione estas variáveis em **Settings > Environment Variables**:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui
JWT_REFRESH_SECRET=sua_chave_refresh_jwt_muito_segura_aqui
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://crm-juridico-frontend.vercel.app
```

⚠️ **IMPORTANTE:** Substitua `DATABASE_URL` pela sua URL real do PostgreSQL

### 1.3 Deploy

1. Clique em **Deploy**
2. Aguarde a build completar
3. Copie a URL do backend (ex: `https://crm-juridico-backend.vercel.app`)

---

## 🎯 PASSO 2: Deploy do Frontend

### 2.1 Criar Novo Projeto na Vercel

1. Acesse https://vercel.com/new novamente
2. Selecione o MESMO repositório: `GEDEON1708/crm-juridico`
3. **Configure assim:**

```
Project Name: crm-juridico-frontend
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.2 Variáveis de Ambiente (Frontend)

Adicione em **Settings > Environment Variables**:

```env
VITE_API_URL=https://crm-juridico-backend.vercel.app/api
```

⚠️ **IMPORTANTE:** Use a URL do backend do PASSO 1.3

### 2.3 Deploy

1. Clique em **Deploy**
2. Aguarde a build completar
3. Acesse a URL do frontend

---

## 🔧 PASSO 3: Ajustes Pós-Deploy

### 3.1 Atualizar CORS no Backend

Se houver erro de CORS, adicione a URL do frontend nas variáveis do backend:

```env
CORS_ORIGIN=https://crm-juridico-frontend.vercel.app
```

### 3.2 Executar Migrações do Prisma

**Opção A: Via Vercel CLI**

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Execute as migrações
vercel env pull .env.production
cd backend
npx prisma migrate deploy
npx prisma generate
```

**Opção B: Adicionar ao package.json do backend**

Modifique o script de build:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && tsc",
    "vercel-build": "prisma generate && prisma migrate deploy && tsc"
  }
}
```

---

## 🗄️ Banco de Dados Recomendado

### Opção 1: Neon (Recomendado)

1. Acesse https://neon.tech
2. Crie conta gratuita
3. Crie novo projeto PostgreSQL
4. Copie a Connection String
5. Cole em `DATABASE_URL` nas variáveis do backend

### Opção 2: Supabase

1. Acesse https://supabase.com
2. Crie novo projeto
3. Vá em Settings > Database
4. Copie Connection String (modo "Connection pooling")
5. Cole em `DATABASE_URL`

### Opção 3: Railway

1. Acesse https://railway.app
2. New Project > Provision PostgreSQL
3. Copie DATABASE_URL das variáveis
4. Use no backend da Vercel

---

## 📝 Checklist de Deploy

### Backend ✅
- [ ] Projeto criado na Vercel com `Root Directory: backend`
- [ ] DATABASE_URL configurada
- [ ] JWT_SECRET e JWT_REFRESH_SECRET configuradas
- [ ] CORS_ORIGIN com URL do frontend
- [ ] Deploy concluído sem erros
- [ ] Migrações Prisma executadas
- [ ] API respondendo (teste: `https://seu-backend.vercel.app/api/health`)

### Frontend ✅
- [ ] Projeto criado na Vercel com `Root Directory: frontend`
- [ ] VITE_API_URL configurada com URL do backend
- [ ] Deploy concluído sem erros
- [ ] Site carregando sem 404
- [ ] Login funcionando
- [ ] Comunicação com API funcionando

---

## 🐛 Troubleshooting

### Erro 404 Persiste no Frontend

**Solução:** Verifique se o `vercel.json` está no frontend:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Erro de CORS

**Solução:** No backend, adicione:

```typescript
// src/server.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

### Erro 500 no Backend

**Solução:** Verifique os logs na Vercel e se `DATABASE_URL` está correta.

### Prisma não encontra o schema

**Solução:** Adicione ao `package.json` do backend:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## 🎉 URLs Finais

Após deploy completo:

- **Frontend:** `https://crm-juridico-frontend.vercel.app`
- **Backend:** `https://crm-juridico-backend.vercel.app`

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs na Vercel
2. Teste a API manualmente: `curl https://seu-backend.vercel.app/api/health`
3. Verifique as variáveis de ambiente

**Desenvolvido por:** Gedeon  
**Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)
