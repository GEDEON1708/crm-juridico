# CRM Jurídico - Sistema de Gestão para Escritórios de Advocacia

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Sobre o Projeto

O **CRM Jurídico** é um sistema completo de gestão para escritórios de advocacia, desenvolvido com tecnologias modernas e foco em segurança, usabilidade e conformidade com a LGPD.

### ✨ Principais Funcionalidades

- 📁 **Gestão de Clientes** - Cadastro completo com histórico e documentação
- ⚖️ **Controle de Processos** - Acompanhamento de casos com partes envolvidas
- ⏰ **Prazos e Alertas** - Sistema automático de notificações para prazos judiciais
- 📅 **Agenda Integrada** - Calendário de audiências e compromissos
- 📄 **Gestão Documental** - Upload, versionamento e geração de peças processuais
- 💰 **Faturamento** - Controle de honorários e contratos
- 👥 **Controle de Acesso** - Permissões por nível (Sócio, Advogado, Estagiário, Administrativo)
- 🔒 **Segurança** - JWT + 2FA opcional para autenticação
- 📊 **Dashboard** - Métricas e produtividade por advogado
- 🔍 **Auditoria** - Logs completos para conformidade LGPD

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação segura
- **2FA** - Autenticação de dois fatores (opcional)
- **Winston** - Sistema de logs

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado e cache
- **React Hook Form** - Formulários
- **Chart.js** - Gráficos e visualizações
- **Zustand** - Estado global

### Banco de Dados
- **PostgreSQL 16** - Banco de dados relacional

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** - Servidor web para frontend

## 🚀 Como Executar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- PostgreSQL 16 (se não usar Docker)

### Opção 1: Com Docker (Recomendado)

1. Clone o repositório:
```bash
git clone <repository-url>
cd crm-juridico
```

2. Configure as variáveis de ambiente:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Acesse a aplicação:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Opção 2: Sem Docker

#### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

4. Execute as migrações do banco:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Inicie o servidor:
```bash
npm run dev
```

#### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
crm-juridico/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Schema do banco de dados
│   ├── src/
│   │   ├── controllers/         # Controladores
│   │   ├── middleware/          # Middlewares (auth, error handling)
│   │   ├── routes/              # Rotas da API
│   │   ├── utils/               # Utilitários
│   │   ├── config/              # Configurações
│   │   └── server.ts            # Arquivo principal
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/               # Páginas
│   │   ├── lib/                 # Bibliotecas (axios)
│   │   ├── store/               # Estado global (Zustand)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
└── docker-compose.yml
```

## 🔐 Segurança

### Autenticação
- JWT com tokens de acesso (15 min) e refresh (7 dias)
- 2FA opcional com TOTP
- Bcrypt para hash de senhas

### Autorização
- Sistema de permissões por roles:
  - **SOCIO**: Acesso total
  - **ADVOGADO**: Gestão de processos e clientes
  - **ESTAGIARIO**: Visualização e tarefas básicas
  - **ADMINISTRATIVO**: Gestão administrativa

### LGPD
- Logs de auditoria completos
- Registro de todas as ações sensíveis
- IP e user-agent tracking

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/2fa/enable` - Habilitar 2FA
- `POST /api/auth/2fa/verify` - Verificar código 2FA
- `POST /api/auth/2fa/disable` - Desabilitar 2FA

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Excluir cliente

### Processos
- `GET /api/cases` - Listar processos
- `GET /api/cases/:id` - Buscar processo
- `POST /api/cases` - Criar processo
- `PUT /api/cases/:id` - Atualizar processo
- `DELETE /api/cases/:id` - Excluir processo

*(Outras rotas disponíveis para prazos, audiências, documentos, etc)*

## 🎨 Design

O sistema utiliza uma paleta de cores sóbria e profissional:
- **Primário**: Azul (#0ea5e9)
- **Dark**: Tons de cinza escuro para texto e backgrounds
- **Tipografia**: Sans-serif moderna e legível

## 📝 Usuário Padrão

Após a primeira execução, você pode criar um usuário através da rota `/api/auth/register`.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas etapas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email: suporte@crmjuridico.com

---

Desenvolvido com ❤️ para advogados por advogados.
