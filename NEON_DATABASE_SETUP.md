# 🚀 GUIA RÁPIDO: Criar Banco PostgreSQL no Neon

## ⏱️ Tempo estimado: 5 minutos

### PASSO 1: Criar Conta
1. Acesse: https://neon.tech
2. Clique em "Sign Up"
3. Use sua conta GitHub ou Google (mais rápido)

### PASSO 2: Criar Projeto
1. Após login, clique em "Create a project"
2. Preencha:
   - **Name:** crm-juridico
   - **Region:** US East (Ohio) - mais próximo
   - **PostgreSQL Version:** 16 (mais recente)
3. Clique em "Create Project"

### PASSO 3: Copiar Connection String
1. Você verá uma tela com a Connection String
2. Copie a string que começa com `postgresql://`
3. Exemplo:
   ```
   postgresql://gedeon:AbCd1234@ep-cool-cloud-123456.us-east-1.aws.neon.tech/crmjuridico?sslmode=require
   ```

### PASSO 4: Adicionar na Vercel
1. Volte para a Vercel
2. Settings → Environment Variables
3. Adicione:
   ```
   Key: DATABASE_URL
   Value: [cole a connection string aqui]
   ```
4. Marque: ✓ Production ✓ Preview
5. Clique em "Save"

### PASSO 5: Redeploy
1. Vá em Deployments
2. Clique em "Redeploy"
3. Aguarde o build completar

---

## 🎉 PRONTO!

Seu banco está criado e configurado.

O Neon oferece:
- ✅ 0.5 GB de armazenamento grátis
- ✅ SSL/TLS automático
- ✅ Backups automáticos
- ✅ Uptime de 99.9%
- ✅ Sem necessidade de cartão de crédito

---

## 🔧 Se Precisar Acessar o Banco Depois

1. Acesse https://console.neon.tech
2. Clique no projeto "crm-juridico"
3. Vá em "SQL Editor" para rodar queries
4. Vá em "Tables" para ver as tabelas criadas pelo Prisma

---

## 📝 Checklist

- [ ] Conta criada no Neon
- [ ] Projeto "crm-juridico" criado
- [ ] Connection String copiada
- [ ] DATABASE_URL adicionada na Vercel
- [ ] Outras 5 variáveis adicionadas (JWT_SECRET, JWT_REFRESH_SECRET, NODE_ENV, PORT, CORS_ORIGIN)
- [ ] Redeploy feito na Vercel
- [ ] Deploy completado com sucesso ✅

---

**Desenvolvido por:** Gedeon  
**Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)
