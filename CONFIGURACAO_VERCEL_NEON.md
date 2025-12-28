# 🔧 Guia de Configuração - Vercel + Neon

## 🔑 Chaves JWT Geradas

Use estas chaves nas variáveis de ambiente da Vercel:

```
JWT_SECRET=a25e1f26c2f2dd4babca88e746a24d5a1e756f268d
JWT_REFRESH_SECRET=48a67d47e6272d3e1d429bc1c2c7a5334adee0629e
```

---

## 📋 Passo a Passo Completo

### PASSO 1: Criar Banco de Dados no Neon (5 minutos)

1. **Acesse:** https://neon.tech
2. **Faça login** ou crie uma conta gratuita
3. **Clique em:** "Create a project" ou "New Project"
4. **Configure:**
   - Project name: `crm-juridico`
   - Region: Escolha a mais próxima (ex: US East)
   - PostgreSQL version: 16 (ou a mais recente)
5. **Clique em:** "Create Project"
6. **Copie a Connection String:**
   - Vá em "Dashboard" → "Connection Details"
   - Copie a string que começa com `postgresql://`
   - Exemplo: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

> **💾 IMPORTANTE:** Salve essa Connection String, você vai precisar dela no próximo passo!

---

### PASSO 2: Configurar Variáveis de Ambiente na Vercel (5 minutos)

1. **Acesse:** https://vercel.com/dashboard

2. **Encontre o projeto do backend:**

   - Procure por `crm-juridico-backend` ou similar
   - Se não existe, você precisará criar um novo projeto primeiro

3. **Vá em:** Settings → Environment Variables

4. **Adicione TODAS estas variáveis:**

#### Variável 1: DATABASE_URL

```
Name: DATABASE_URL
Value: [Cole aqui a Connection String do Neon que você copiou]
Environment: Production, Preview, Development (marque todas)
```

#### Variável 2: JWT_SECRET

```
Name: JWT_SECRET
Value: a25e1f26c2f2dd4babca88e746a24d5a1e756f268d
Environment: Production, Preview, Development (marque todas)
```

#### Variável 3: JWT_REFRESH_SECRET

```
Name: JWT_REFRESH_SECRET
Value: 48a67d47e6272d3e1d429bc1c2c7a5334adee0629e
Environment: Production, Preview, Development (marque todas)
```

#### Variável 4: NODE_ENV

```
Name: NODE_ENV
Value: production
Environment: Production (apenas Production)
```

#### Variável 5: CORS_ORIGIN

```
Name: CORS_ORIGIN
Value: * (por enquanto, depois você atualiza com a URL do frontend)
Environment: Production, Preview, Development (marque todas)
```

5. **Clique em "Save"** para cada variável

---

### PASSO 3: Fazer Redeploy na Vercel (2 minutos)

1. **No projeto backend na Vercel:**

   - Vá em "Deployments"
   - Clique nos 3 pontinhos (...) do último deployment
   - Clique em "Redeploy"
   - Confirme "Redeploy"

2. **Aguarde o deploy completar** (2-3 minutos)

3. **Verifique se deu certo:**
   - Copie a URL do projeto (ex: `https://crm-juridico-backend.vercel.app`)
   - Acesse: `https://sua-url.vercel.app/health`
   - Deve retornar: `{"status":"OK","timestamp":"..."}`

---

### PASSO 4: Atualizar Frontend (se já tiver deployado)

1. **Acesse o projeto do frontend na Vercel**

2. **Vá em:** Settings → Environment Variables

3. **Adicione ou atualize:**

```
Name: VITE_API_URL
Value: https://sua-url-backend.vercel.app/api
Environment: Production, Preview, Development (marque todas)
```

4. **Faça Redeploy do frontend**

---

## ✅ Checklist de Verificação

### Neon Database

- [ ] Conta criada no Neon
- [ ] Projeto PostgreSQL criado
- [ ] Connection String copiada

### Vercel Backend

- [ ] DATABASE_URL configurada
- [ ] JWT_SECRET configurada
- [ ] JWT_REFRESH_SECRET configurada
- [ ] NODE_ENV configurada
- [ ] CORS_ORIGIN configurada
- [ ] Redeploy realizado
- [ ] `/health` retorna status OK

### Vercel Frontend (opcional)

- [ ] VITE_API_URL configurada
- [ ] Redeploy realizado

---

## 🐛 Troubleshooting

### Erro: "Failed to connect to database"

- Verifique se a Connection String do Neon está correta
- Certifique-se de que tem `?sslmode=require` no final da URL

### Erro: "Environment variable not found"

- Verifique se salvou todas as 5 variáveis
- Certifique-se de que marcou os ambientes corretos
- Faça redeploy após adicionar variáveis

### Erro 500 persiste

- Verifique os logs na Vercel (Deployments → View Function Logs)
- Certifique-se de que o redeploy foi feito APÓS configurar as variáveis

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema, me avise! Posso te ajudar a:

- Verificar se as configurações estão corretas
- Analisar logs de erro
- Testar os endpoints da API

---

**Desenvolvido por:** Gedeon  
**Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)
