# 🚀 Guia de Início Rápido - CRM Jurídico

## Instalação e Configuração

### 1. Instalar Dependências

```powershell
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

### 2. Configurar Banco de Dados

Opção A: PostgreSQL local instalado na máquina.
Opção B: Docker:

```powershell
docker run --name crm-juridico-db -e POSTGRES_PASSWORD=senha123 -e POSTGRES_DB=crm_juridico -p 5432:5432 -d postgres:16-alpine
```

### 3. Configurar Variáveis de Ambiente

```powershell
# Backend
cd backend
copy .env.example .env
# Edite o arquivo .env com suas configurações
```

Principais variáveis:
- `DATABASE_URL`: String de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (gere uma forte!)
- `JWT_REFRESH_SECRET`: Chave para refresh tokens

```powershell
# Frontend
cd frontend
copy .env.example .env
```

### 4. Executar Migrações do Banco

```powershell
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Iniciar os Servidores

```powershell
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 6. Acessar o Sistema

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio (opcional): `npx prisma studio`

## Primeiro Acesso

1. Acesse http://localhost:3000
2. Como não há usuários, registre o primeiro através da API:

```powershell
# Use curl, Postman ou Insomnia
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Admin\",\"email\":\"admin@escritorio.com\",\"password\":\"senha123\",\"role\":\"SOCIO\"}"
```

3. Faça login com as credenciais criadas

## Usando Docker (Modo Produção)

```powershell
# Na raiz do projeto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Estrutura de Permissões

- **SOCIO**: Acesso total ao sistema
- **ADVOGADO**: Gestão de processos, clientes e documentos
- **ESTAGIARIO**: Visualização e tarefas básicas
- **ADMINISTRATIVO**: Gestão financeira e administrativa

## Recursos Principais

### Dashboard
- Visão geral do escritório
- Métricas de produtividade
- Prazos próximos

### Clientes
- Cadastro completo (CPF/CNPJ, contatos, endereço)
- Histórico de processos
- Contratos vinculados

### Processos
- Número, tipo, status
- Partes envolvidas
- Timeline de eventos
- Documentos anexados
- Prazos e audiências

### Documentos
- Upload e versionamento
- Geração de peças a partir de templates
- Organização por processo

### Agenda
- Audiências
- Reuniões
- Compromissos
- Notificações automáticas

### Prazos
- Controle de prazos judiciais
- Alertas automáticos (3, 5, 7 dias antes)
- Filtros por status e prioridade

### Honorários
- Registro de valores
- Controle de pagamentos
- Relatórios financeiros

## Comandos Úteis

### Backend

```powershell
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Migrations
npx prisma migrate dev
npx prisma migrate deploy  # Produção

# Seed database (se configurado)
npm run prisma:seed

# Visualizar banco
npx prisma studio
```

### Frontend

```powershell
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Troubleshooting

### Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confirme a string de conexão no `.env`
- Teste: `psql -U postgres -h localhost`

### Porta já em uso
```powershell
# Windows - Encontrar processo na porta 3001
netstat -ano | findstr :3001

# Matar processo
taskkill /PID <PID> /F
```

### Prisma Client não encontrado
```powershell
npx prisma generate
```

### Erro de CORS
- Verifique a variável `CORS_ORIGIN` no backend `.env`
- Deve apontar para `http://localhost:3000` em desenvolvimento

## Próximos Passos

1. Configure o envio de emails (SMTP no `.env`)
2. Implemente templates de documentos personalizados
3. Configure backup automático do banco de dados
4. Adicione integração com APIs jurídicas (se necessário)
5. Configure SSL para produção

## Suporte

- Documentação completa: `README.md`
- Issues: GitHub Issues
- Email: suporte@crmjuridico.com

---

✅ Sistema pronto para uso! Boa gestão! ⚖️
