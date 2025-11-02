# 🎯 PASSO A PASSO COMPLETO - Neon + Vercel

## ✅ VOCÊ ESTÁ AQUI: Conta Neon criada

---

## 📍 PASSO 1: Copiar a Connection String do Neon

### 1.1 Acesse o Console do Neon
- Vá em: https://console.neon.tech
- Faça login (se não estiver logado)

### 1.2 Criar ou Selecionar Projeto

**Se você JÁ criou um projeto:**
1. Clique no projeto (ex: "crm-juridico")
2. Vá para o **PASSO 1.3**

**Se você NÃO criou projeto ainda:**
1. Clique em **"Create a project"** (botão verde)
2. Preencha:
   ```
   Project name: crm-juridico
   Region: US East (Ohio) - us-east-2
   PostgreSQL version: 16
   ```
3. Clique em **"Create project"**

### 1.3 Copiar a Connection String

Depois de criar/abrir o projeto, você verá uma tela assim:

```
┌─────────────────────────────────────────────────────┐
│  Connection Details                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Connection string:                                 │
│  ┌───────────────────────────────────────────────┐ │
│  │ postgresql://user:pass@ep-xxx.neon.tech/...  │ │
│  │                                    [📋 Copy]   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**COPIE** essa string completa! Ela será parecida com:
```
postgresql://gedeon_user:AbCd1234XyZ@ep-cool-cloud-123456.us-east-2.aws.neon.tech/crmjuridico?sslmode=require
```

⚠️ **IMPORTANTE:** 
- Se não vir a connection string, clique em **"Connection Details"** ou **"Dashboard"**
- Pode estar em: **Dashboard → Connection Details → Connection string**

---

## 📍 PASSO 2: Adicionar Variáveis na Vercel

### 2.1 Acesse seu Projeto na Vercel
1. Vá em: https://vercel.com/dashboard
2. Clique no projeto do backend (deve estar com erro)
   - Se o nome é "crm-juridico", clique nele
   - Se você usou outro nome, clique no projeto correto

### 2.2 Entre nas Configurações
1. Clique na aba **"Settings"** (topo da página)
2. No menu lateral esquerdo, clique em **"Environment Variables"**

### 2.3 Adicionar as 6 Variáveis

Agora você vai adicionar cada variável. Para cada uma:

---

#### ✅ VARIÁVEL 1: DATABASE_URL

```
┌──────────────────────────────────────────────────┐
│ Key                                              │
│ ┌──────────────────────────────────────────────┐ │
│ │ DATABASE_URL                                 │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Value                                            │
│ ┌──────────────────────────────────────────────┐ │
│ │ [COLE AQUI A CONNECTION STRING DO NEON]      │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Environments                                     │
│ ☑ Production  ☑ Preview  ☐ Development          │
│                                                  │
│                                    [Save]        │
└──────────────────────────────────────────────────┘
```

**Preencha:**
1. **Key:** `DATABASE_URL`
2. **Value:** Cole a connection string que você copiou do Neon
3. **Marque:** ✅ Production e ✅ Preview
4. Clique em **"Save"**

---

#### ✅ VARIÁVEL 2: JWT_SECRET

```
Key: JWT_SECRET
Value: 02e1d4e09d84070ce5ee768ed4de9dd0b028391586ceb96625e3cde5ad3edc5b
```

**Preencha:**
1. **Key:** `JWT_SECRET`
2. **Value:** `02e1d4e09d84070ce5ee768ed4de9dd0b028391586ceb96625e3cde5ad3edc5b`
3. **Marque:** ✅ Production e ✅ Preview
4. Clique em **"Save"**

---

#### ✅ VARIÁVEL 3: JWT_REFRESH_SECRET

```
Key: JWT_REFRESH_SECRET
Value: 416b9a479e72fcee8d3e5e31f96ab758df4e670092930c827e796139db221395
```

**Preencha:**
1. **Key:** `JWT_REFRESH_SECRET`
2. **Value:** `416b9a479e72fcee8d3e5e31f96ab758df4e670092930c827e796139db221395`
3. **Marque:** ✅ Production e ✅ Preview
4. Clique em **"Save"**

---

#### ✅ VARIÁVEL 4: NODE_ENV

```
Key: NODE_ENV
Value: production
```

**Preencha:**
1. **Key:** `NODE_ENV`
2. **Value:** `production`
3. **Marque:** ✅ Production e ✅ Preview
4. Clique em **"Save"**

---

#### ✅ VARIÁVEL 5: PORT

```
Key: PORT
Value: 3001
```

**Preencha:**
1. **Key:** `PORT`
2. **Value:** `3001`
3. **Marque:** ✅ Production e ✅ Preview
4. Clique em **"Save"**

---

#### ✅ VARIÁVEL 6: CORS_ORIGIN

```
Key: CORS_ORIGIN
Value: *
```

**Preencha:**
1. **Key:** `CORS_ORIGIN`
2. **Value:** `*` (apenas um asterisco)
3. **Marque:** ✅ Production e ✅ Preview
4. Clique em **"Save"**

---

## 📍 PASSO 3: Fazer Redeploy

Agora que todas as variáveis estão configuradas:

### 3.1 Ir para Deployments
1. Clique na aba **"Deployments"** (topo da página)
2. Você verá uma lista de deploys (o último deve estar com erro vermelho ❌)

### 3.2 Redeploy
1. No deploy mais recente (topo da lista), clique nos **3 pontinhos** `⋮`
2. No menu que abrir, clique em **"Redeploy"**
3. Uma janela vai aparecer confirmando
4. Clique em **"Redeploy"** novamente (botão azul)

### 3.3 Acompanhar o Build
1. Você será redirecionado para a página do novo deploy
2. Aguarde o build completar (2-5 minutos)
3. Você verá logs em tempo real
4. Quando aparecer **"Ready"** com ✅, está pronto!

---

## 📍 PASSO 4: Copiar URL do Backend

Após o deploy completar com sucesso:

### 4.1 Encontrar a URL
1. Na página do deploy, procure por:
   ```
   🌐 Domains
   https://crm-juridico-backend.vercel.app
   ```
2. **COPIE** essa URL completa

### 4.2 Testar a API
1. Abra uma nova aba no navegador
2. Cole a URL + `/api/health`:
   ```
   https://crm-juridico-backend.vercel.app/api/health
   ```
3. Se aparecer uma resposta JSON, está funcionando! ✅

---

## 📍 PASSO 5: Deploy do Frontend

Agora que o backend está funcionando, vamos deployar o frontend:

### 5.1 Criar Novo Projeto na Vercel
1. Vá em: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório: **GEDEON1708/crm-juridico**
4. Clique em **"Import"**

### 5.2 Configurar o Frontend
```
Project Name: crm-juridico-frontend

Root Directory: frontend    ⚠️ CLIQUE EM "EDIT" E SELECIONE "frontend"

Framework Preset: Vite

Build Command: npm run build

Output Directory: dist

Install Command: npm install
```

### 5.3 Adicionar Variável de Ambiente do Frontend

Clique em **"Environment Variables"** (antes de fazer deploy):

```
Key: VITE_API_URL
Value: https://crm-juridico-backend.vercel.app/api
```

⚠️ **IMPORTANTE:** Use a URL do backend que você copiou no PASSO 4.1 e adicione `/api` no final!

**Marque:** ✅ Production e ✅ Preview

### 5.4 Deploy
1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Quando aparecer **"Ready"** com ✅, está pronto!

---

## 📍 PASSO 6: Atualizar CORS no Backend

Agora que o frontend está deployado:

### 6.1 Copiar URL do Frontend
Na página do deploy do frontend, copie a URL:
```
https://crm-juridico-frontend.vercel.app
```

### 6.2 Atualizar Variável CORS_ORIGIN no Backend
1. Vá no projeto do **backend** na Vercel
2. Settings → Environment Variables
3. Encontre a variável `CORS_ORIGIN`
4. Clique em **"Edit"** (ícone de lápis ✏️)
5. Altere o valor de `*` para a URL do frontend:
   ```
   https://crm-juridico-frontend.vercel.app
   ```
6. Clique em **"Save"**

### 6.3 Redeploy do Backend
1. Vá em Deployments (do backend)
2. Clique nos 3 pontinhos do último deploy
3. Clique em "Redeploy"
4. Aguarde completar

---

## 🎉 PASSO 7: Testar Tudo

### 7.1 Acessar o Frontend
1. Abra a URL do frontend no navegador:
   ```
   https://crm-juridico-frontend.vercel.app
   ```

### 7.2 Fazer Login
Use as credenciais padrão:
```
Email: admin@example.com
Senha: Admin@123
```

### 7.3 Verificar Funcionalidades
- ✅ Login funciona?
- ✅ Dashboard carrega?
- ✅ Consegue ver clientes, casos, etc?

Se tudo funcionar: **🎉 PARABÉNS! DEPLOY COMPLETO!**

---

## 📋 Checklist Final

### Backend ✅
- [ ] Connection String do Neon copiada
- [ ] 6 variáveis adicionadas na Vercel
- [ ] Redeploy feito
- [ ] Deploy completou com sucesso (Ready ✅)
- [ ] URL do backend copiada
- [ ] API respondendo (testado /api/health)

### Frontend ✅
- [ ] Novo projeto criado na Vercel
- [ ] Root Directory configurado como "frontend"
- [ ] VITE_API_URL adicionada
- [ ] Deploy completou com sucesso (Ready ✅)
- [ ] URL do frontend copiada
- [ ] CORS_ORIGIN atualizada no backend
- [ ] Login funcionando

### Testes ✅
- [ ] Frontend carrega sem erros
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] API conecta corretamente

---

## 🐛 Se Algo Der Errado

### Backend não faz build
- Verifique se DATABASE_URL está correta
- Teste a connection string copiando direto do Neon
- Veja os logs do deploy na Vercel

### Frontend não conecta ao Backend
- Verifique se VITE_API_URL tem `/api` no final
- Verifique se CORS_ORIGIN está com a URL do frontend
- Faça redeploy do backend após atualizar CORS

### Erro de CORS
- Atualize CORS_ORIGIN no backend
- Faça redeploy do backend
- Aguarde alguns minutos

---

**Desenvolvido por:** Gedeon  
**Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)

## 📞 Dúvidas?

Me avise em que passo você está e se precisar de ajuda!
