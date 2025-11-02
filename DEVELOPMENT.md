# 🛡️ Políticas de Segurança e Boas Práticas

## Segurança

### Autenticação e Autorização

1. **JWT Tokens**
   - Access Token: 15 minutos de validade
   - Refresh Token: 7 dias de validade
   - Tokens armazenados no localStorage (frontend)
   - Refresh automático implementado

2. **Senhas**
   - Hash com bcrypt (salt rounds: 12)
   - Mínimo de 6 caracteres (ajuste conforme necessário)
   - Nunca retornar senhas nas respostas da API

3. **2FA (Opcional)**
   - TOTP com otplib
   - QR Code para configuração
   - Código de 6 dígitos com validade de 30 segundos

### Boas Práticas de Código

#### Backend

```typescript
// ✅ BOM - Sempre validar entrada do usuário
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const { error, value } = schema.validate(req.body);

// ✅ BOM - Usar try/catch e next(error)
try {
  // código
} catch (error) {
  next(error);
}

// ✅ BOM - Usar prepared statements (Prisma faz isso automaticamente)
const user = await prisma.user.findUnique({
  where: { email: email }
});

// ❌ RUIM - SQL injection vulnerável
// db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

#### Frontend

```typescript
// ✅ BOM - Validar formulários
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

// ✅ BOM - Sanitizar entrada HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);

// ✅ BOM - Usar HTTPS em produção
// Configure SSL no Nginx ou use serviços como Cloudflare
```

## Performance

### Backend

1. **Indexação do Banco**
   ```prisma
   model User {
     id    String @id @default(uuid())
     email String @unique // ← Index automático
     
     @@index([createdAt]) // Index personalizado
   }
   ```

2. **Paginação**
   ```typescript
   const users = await prisma.user.findMany({
     skip: (page - 1) * limit,
     take: limit,
   });
   ```

3. **Select Específico**
   ```typescript
   // ✅ BOM - Selecionar apenas campos necessários
   const user = await prisma.user.findUnique({
     where: { id },
     select: { id: true, name: true, email: true }
   });
   
   // ❌ EVITAR - Retornar todos os campos
   // const user = await prisma.user.findUnique({ where: { id } });
   ```

### Frontend

1. **React Query**
   - Cache automático de 5 minutos
   - Refetch inteligente
   - Loading states

2. **Lazy Loading**
   ```typescript
   const Cases = lazy(() => import('./pages/Cases'));
   ```

3. **Memoização**
   ```typescript
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
   ```

## LGPD - Conformidade

### Dados Coletados
- Nome, email, telefone
- CPF/CNPJ
- Endereço
- Dados processuais

### Implementações Obrigatórias

1. **Logs de Auditoria** ✅
   - Todas as ações importantes são registradas
   - IP e User-Agent tracking
   - Timestamp de todas as operações

2. **Direito ao Esquecimento**
   ```typescript
   // Implementar rota para anonimizar dados
   POST /api/users/:id/anonymize
   ```

3. **Exportação de Dados**
   ```typescript
   // Implementar rota para exportar dados do usuário
   GET /api/users/:id/export
   ```

4. **Consentimento**
   - Termo de uso e política de privacidade
   - Checkbox obrigatório no cadastro
   - Registro de aceite com data/hora

### Exemplo de Implementação

```typescript
// Anonimizar usuário
async function anonymizeUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: 'Usuário Anonimizado',
      email: `anonimo-${userId}@deleted.com`,
      cpf: null,
      phone: null,
      isActive: false,
    }
  });
  
  // Log de auditoria
  await createAuditLog('ANONYMIZE', 'User', userId, userId, null, null, 'Dados anonimizados conforme LGPD');
}
```

## Testes

### Backend - Jest

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

```typescript
// __tests__/auth.test.ts
describe('Auth', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.user).toHaveProperty('id');
  });
});
```

### Frontend - Vitest

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## Deploy

### Variáveis de Ambiente - Produção

```env
# Backend
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_SECRET="USE_UM_SECRET_MUITO_FORTE_AQUI_COM_PELO_MENOS_32_CARACTERES"
JWT_REFRESH_SECRET="OUTRO_SECRET_DIFERENTE_E_FORTE"
NODE_ENV="production"
CORS_ORIGIN="https://seu-dominio.com"

# SMTP para emails reais
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-de-app"
```

### Checklist de Deploy

- [ ] Configurar HTTPS (SSL/TLS)
- [ ] Variáveis de ambiente seguras
- [ ] Backups automáticos do banco
- [ ] Monitoramento (Sentry, LogRocket)
- [ ] Rate limiting configurado
- [ ] CORS restrito ao domínio
- [ ] Logs centralizados
- [ ] Testes passando
- [ ] Migrations aplicadas

### Recomendações de Hosting

#### Backend
- **Railway** (fácil e rápido)
- **Heroku** (clássico)
- **AWS EC2** (controle total)
- **DigitalOcean** (VPS)

#### Frontend
- **Vercel** (recomendado para React)
- **Netlify**
- **AWS S3 + CloudFront**

#### Banco de Dados
- **Supabase** (PostgreSQL managed)
- **Railway** (incluído)
- **AWS RDS**
- **DigitalOcean Managed Databases**

## Monitoramento

### Backend - PM2

```bash
npm install -g pm2

# Iniciar
pm2 start dist/server.js --name crm-backend

# Monitorar
pm2 monit

# Logs
pm2 logs

# Restart
pm2 restart crm-backend
```

### Sentry (Error Tracking)

```bash
npm install @sentry/node @sentry/tracing
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

## Manutenção

### Backups do Banco

```bash
# Backup manual
pg_dump -U usuario -h host -d crm_juridico > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U usuario -h host -d crm_juridico < backup_20240101.sql
```

### Atualização de Dependências

```bash
# Verificar atualizações
npm outdated

# Atualizar minor/patch
npm update

# Atualizar major (cuidado!)
npm install <package>@latest
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit (`git commit -m 'Add: Nova feature'`)
4. Push (`git push origin feature/MinhaFeature`)
5. Pull Request

### Padrão de Commits

- `Add:` Nova funcionalidade
- `Fix:` Correção de bug
- `Update:` Atualização de código existente
- `Remove:` Remoção de código
- `Refactor:` Refatoração
- `Docs:` Documentação
- `Test:` Testes

## Contato

Para dúvidas ou sugestões:
- Email: suporte@crmjuridico.com
- GitHub Issues: [Link do repositório]

---

Desenvolvido com ❤️ e ☕ para advogados.
