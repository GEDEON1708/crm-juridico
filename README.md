# ⚖️ CRM Jurídico - Sistema de Gestão para Escritórios de Advocacia

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production-brightgreen.svg)
![CI](https://github.com/seu-usuario/crm-juridico/actions/workflows/ci.yml/badge.svg)

**Sistema completo de gestão para escritórios de advocacia com recursos avançados de organização processual, financeira e administrativa.**

[🇧🇷 Português](#-português) • [🇺🇸 English](#-english)

</div>

---

## 🇧🇷 Português

### 📋 Sobre o Projeto

O **CRM Jurídico** é um sistema robusto desenvolvido para modernizar e otimizar a gestão de escritórios de advocacia. Com interface intuitiva e recursos completos, permite o controle eficiente de casos, clientes, prazos processuais, documentos e honorários.

**Desenvolvido por:** [Gedeon](https://github.com/seu-usuario) | **Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)

### ✨ Características Principais

- 📊 **Dashboard Completo** - Visão geral com estatísticas e gráficos em tempo real
- 👥 **Gestão de Clientes** - Cadastro completo com histórico de casos
- ⚖️ **Controle de Casos** - Timeline de atividades e status tracking
- 📅 **Agenda Integrada** - Calendário de audiências, reuniões e compromissos
- ⏰ **Prazos Processuais** - Sistema de alertas com priorização automática
- 📄 **Gestão de Documentos** - Upload, download e organização de arquivos
- 💰 **Controle de Honorários** - Dashboard financeiro com status de pagamentos
- 🔔 **Notificações em Tempo Real** - Alertas automáticos de prazos e eventos
- 🔐 **Sistema de Autenticação** - JWT com controle de acesso por perfil
- 👤 **Perfis de Usuário** - Sócio, Advogado e Assistente com permissões específicas

### 🛠️ Tecnologias Utilizadas

#### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

- **Node.js 20+** com **TypeScript** para backend robusto e type-safe
- **Express.js** para APIs RESTful rápidas e escaláveis
- **Prisma ORM** para gerenciamento elegante do banco de dados
- **PostgreSQL 16** como banco de dados relacional
- **JWT** para autenticação segura com refresh tokens
- **Bcrypt** para hash de senhas
- **Multer** para upload de arquivos
- **Winston** para sistema de logs
- **Helmet** e **CORS** para segurança
- **Rate Limiting** para proteção contra abuso

#### Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

- **React 18** com **TypeScript** para UI moderna e reativa
- **Vite** para desenvolvimento rápido e builds otimizados
- **Tailwind CSS** para estilização responsiva e moderna
- **React Query** para gerenciamento de estado servidor
- **Zustand** para gerenciamento de estado global
- **React Hook Form** para formulários performáticos
- **React Router DOM** para navegação SPA
- **Heroicons** para iconografia
- **Recharts** para gráficos e visualizações
- **React Toastify** para notificações

#### DevOps & Tools

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)

- **Docker** e **Docker Compose** para containerização
- **Git** para controle de versão
- **ESLint** e **Prettier** para qualidade de código
- **Nodemon** para hot-reload no desenvolvimento

### 🚀 Instalação e Execução

#### Pré-requisitos

- Node.js 20+
- PostgreSQL 16+ (ou Docker)
- Git

#### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/crm-juridico.git
cd crm-juridico
```

#### 2️⃣ Configurar Backend

```bash
cd backend
npm install
```

Criar arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://crmjuridico:senha_super_segura_123@localhost:5433/crm_juridico?schema=public"

# JWT
JWT_SECRET="seu_secret_super_seguro_aqui"
JWT_REFRESH_SECRET="seu_refresh_secret_super_seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

Executar migrações e seed:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Iniciar servidor:

```bash
npm run dev
```

#### 3️⃣ Configurar Frontend

```bash
cd frontend
npm install
```

Criar arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Iniciar aplicação:

```bash
npm run dev
```

#### 4️⃣ Usar Docker (Opcional)

```bash
# Na raiz do projeto
docker-compose up -d
```

#### 5️⃣ Usar Scripts de Automação (Windows)

```powershell
# Iniciar tudo automaticamente
.\start.ps1

# Parar sistema
.\stop.ps1
```

### 🚀 Fluxo de Release (Tag)

Com o workflow de release configurado, publique uma versão assim:

```bash
git tag v1.0.1
git push origin v1.0.1
```

Ao enviar a tag `v*.*.*`, o GitHub Actions cria a release automaticamente com notas geradas.

### 🔑 Credenciais de Teste

Após executar o seed, use estas credenciais para acessar:

| Perfil | Email | Senha |
|--------|-------|-------|
| **Sócio** (Admin) | socio@exemplo.com | senha123 |
| **Advogado** | advogado@exemplo.com | senha123 |
| **Assistente** | assistente@exemplo.com | senha123 |

### 📁 Estrutura do Projeto

```
crm-juridico/
├── backend/                 # API REST em Node.js + TypeScript
│   ├── prisma/             # Schema e migrações do banco
│   │   ├── schema.prisma   # Definição dos modelos
│   │   └── seed.ts         # Dados iniciais
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── middleware/     # Autenticação, validação, erros
│   │   ├── routes/         # Rotas da API
│   │   ├── utils/          # Funções auxiliares
│   │   └── server.ts       # Configuração do servidor
│   └── uploads/            # Arquivos enviados
│
├── frontend/               # Interface em React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── store/          # Estado global (Zustand)
│   │   ├── lib/            # Configurações (Axios, etc)
│   │   └── App.tsx         # Componente raiz
│   └── public/             # Assets estáticos
│
├── docs/                   # Documentação completa
│   ├── ANALISE_COMPLETA.md
│   ├── MANUTENCAO.md
│   └── CHECKLIST.md
│
├── start.ps1              # Script de inicialização (Windows)
├── stop.ps1               # Script para parar (Windows)
└── docker-compose.yml     # Configuração Docker
```

### 🎯 Funcionalidades Detalhadas

#### 1. Dashboard
- Estatísticas gerais (casos ativos, clientes, prazos urgentes)
- Gráficos de casos por status
- Gráfico de honorários por período
- Lista de atividades recentes
- Alertas de prazos próximos

#### 2. Gestão de Clientes
- CRUD completo de clientes
- Busca e filtros avançados
- Histórico de casos por cliente
- Documentos vinculados
- Informações de contato completas

#### 3. Gestão de Casos
- CRUD completo de processos
- Status tracking (Novo, Em Andamento, Suspenso, Arquivado, Ganho, Perdido)
- Timeline de atividades
- Vinculação com clientes e advogados
- Upload de documentos
- Histórico de movimentações

#### 4. Agenda e Compromissos
- Visualização em calendário mensal
- Tipos: Audiência, Reunião, Prazo, Outro
- Vinculação com casos
- Alertas e lembretes
- Status: Agendado, Confirmado, Concluído, Cancelado

#### 5. Prazos Processuais
- Sistema de prioridades (Baixa, Média, Alta, Urgente)
- Detecção automática de prazos vencidos
- Indicadores visuais de urgência
- Filtros por status e prioridade
- Notificações automáticas

#### 6. Documentos
- Upload de arquivos (até 10MB)
- Download seguro de documentos
- Tipos: Petição, Contrato, Procuração, Sentença, etc.
- Vinculação com casos e clientes
- Organização por categoria

#### 7. Controle de Honorários
- Registro de valores e parcelas
- Status: Pendente, Pago, Atrasado
- Dashboard financeiro
- Filtros por período e status
- Estatísticas de recebimentos

#### 8. Sistema de Notificações
- Notificações em tempo real
- Tipos: Prazo, Audiência, Pagamento, Documento, Cliente
- Badge com contador de não lidas
- Auto-refresh a cada 30 segundos
- Ações: Marcar como lida, Deletar, Marcar todas

#### 9. Perfil de Usuário
- Edição de informações pessoais
- Upload de foto de perfil
- Alteração de senha
- Configurações de notificações

#### 10. Segurança
- Autenticação JWT com refresh tokens
- Controle de acesso por perfil (RBAC)
- Hash de senhas com Bcrypt
- Rate limiting para proteção contra abuso
- Headers de segurança com Helmet
- CORS configurado

### 📊 API Endpoints

#### Autenticação
```
POST   /api/auth/login          # Login
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/logout         # Logout
```

#### Usuários
```
GET    /api/users               # Listar usuários
GET    /api/users/:id           # Buscar usuário
PUT    /api/users/:id           # Atualizar usuário
POST   /api/users/:id/profile-image  # Upload foto
```

#### Clientes
```
GET    /api/clients             # Listar clientes
POST   /api/clients             # Criar cliente
GET    /api/clients/:id         # Buscar cliente
PUT    /api/clients/:id         # Atualizar cliente
DELETE /api/clients/:id         # Deletar cliente
```

#### Casos
```
GET    /api/cases               # Listar casos
POST   /api/cases               # Criar caso
GET    /api/cases/:id           # Buscar caso
PUT    /api/cases/:id           # Atualizar caso
DELETE /api/cases/:id           # Deletar caso
```

#### Compromissos
```
GET    /api/appointments        # Listar compromissos
POST   /api/appointments        # Criar compromisso
GET    /api/appointments/:id    # Buscar compromisso
PUT    /api/appointments/:id    # Atualizar compromisso
DELETE /api/appointments/:id    # Deletar compromisso
```

#### Prazos
```
GET    /api/deadlines           # Listar prazos
POST   /api/deadlines           # Criar prazo
GET    /api/deadlines/:id       # Buscar prazo
PUT    /api/deadlines/:id       # Atualizar prazo
DELETE /api/deadlines/:id       # Deletar prazo
```

#### Documentos
```
GET    /api/documents           # Listar documentos
POST   /api/documents           # Upload documento
GET    /api/documents/:id       # Buscar documento
DELETE /api/documents/:id       # Deletar documento
GET    /api/documents/:id/download  # Download documento
```

#### Honorários
```
GET    /api/fees                # Listar honorários
POST   /api/fees                # Criar honorário
GET    /api/fees/:id            # Buscar honorário
PUT    /api/fees/:id            # Atualizar honorário
DELETE /api/fees/:id            # Deletar honorário
```

#### Notificações
```
GET    /api/notifications       # Listar notificações
PUT    /api/notifications/:id/read    # Marcar como lida
PUT    /api/notifications/read-all    # Marcar todas como lidas
DELETE /api/notifications/:id         # Deletar notificação
```

#### Dashboard
```
GET    /api/dashboard/stats     # Estatísticas gerais
GET    /api/dashboard/activities # Atividades recentes
```

### 🔒 Segurança e Boas Práticas

- ✅ Autenticação JWT com tokens de curta duração
- ✅ Refresh tokens para renovação automática
- ✅ Hash de senhas com Bcrypt (10 rounds)
- ✅ Validação de dados com Joi
- ✅ Sanitização de inputs
- ✅ Rate limiting (100 requisições por 15 minutos)
- ✅ CORS configurado para origem específica
- ✅ Headers de segurança com Helmet
- ✅ Logs estruturados com Winston
- ✅ Controle de acesso baseado em papéis (RBAC)
- ✅ Validação de tipos com TypeScript
- ✅ Tratamento centralizado de erros

### 📈 Roadmap

Veja o arquivo [ROADMAP.md](ROADMAP.md) para funcionalidades planejadas:

- 🔄 Integração com Google Calendar
- 📧 Sistema de e-mail automatizado
- 📱 Aplicativo mobile (React Native)
- 🤖 Automação de tarefas repetitivas
- 📊 Relatórios avançados em PDF
- 🔍 Busca full-text
- 💬 Chat interno entre usuários
- 🔔 Notificações push
- 📤 Exportação de dados
- 🌍 Multi-idiomas

### 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

### 👨‍💻 Desenvolvedor

**Gedeon**
- Website: [Okapi Code Forge](https://okapi-code-forge.vercel.app/)

Para dúvidas ou problemas:

1. Consulte a [documentação completa](docs/)
2. Verifique as [issues abertas](https://github.com/seu-usuario/crm-juridico/issues)
3. Abra uma [nova issue](https://github.com/seu-usuario/crm-juridico/issues/new)


## 🇺🇸 English

### 📋 About the Project

**CRM Jurídico** is a robust system developed to modernize and optimize law firm management. With an intuitive interface and complete features, it enables efficient control of cases, clients, procedural deadlines, documents, and fees.

**Developed by:** [Gedeon](https://github.com/seu-usuario) | **Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)

### ✨ Main Features

- 📊 **Complete Dashboard** - Overview with real-time statistics and charts
- 👥 **Client Management** - Complete registration with case history
- ⚖️ **Case Control** - Activity timeline and status tracking
- 📅 **Integrated Calendar** - Schedule for hearings, meetings, and appointments
- ⏰ **Procedural Deadlines** - Alert system with automatic prioritization
- 📄 **Document Management** - Upload, download, and file organization
- 💰 **Fee Control** - Financial dashboard with payment status
- 🔔 **Real-time Notifications** - Automatic alerts for deadlines and events
- 🔐 **Authentication System** - JWT with role-based access control
- 👤 **User Profiles** - Partner, Lawyer, and Assistant with specific permissions

### 🛠️ Technologies Used

#### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

- **Node.js 20+** with **TypeScript**
- **Express.js** for RESTful APIs
- **Prisma ORM** for database management
- **PostgreSQL 16** as relational database
- **JWT** for secure authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Winston** for logging system

#### Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

- **React 18** with **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Zustand** for global state
- **React Hook Form** for forms
- **Recharts** for charts and visualizations

### 🚀 Quick Start

#### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Git

#### Installation

```bash
# Clone repository
git clone https://github.com/seu-usuario/crm-juridico.git
cd crm-juridico

# Setup backend
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

#### Docker Setup

```bash
docker-compose up -d
```

### 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Partner** (Admin) | socio@exemplo.com | senha123 |
| **Lawyer** | advogado@exemplo.com | senha123 |
| **Assistant** | assistente@exemplo.com | senha123 |

### 📁 Project Structure

```
crm-juridico/
├── backend/           # REST API (Node.js + TypeScript)
├── frontend/          # UI (React + TypeScript)
├── docs/              # Documentation
├── start.ps1          # Start script (Windows)
└── docker-compose.yml # Docker configuration
```

### 🎯 Key Features

1. **Dashboard** - Real-time statistics and charts
2. **Client Management** - Complete CRUD with history
3. **Case Management** - Status tracking and timeline
4. **Calendar** - Integrated schedule system
5. **Deadlines** - Priority-based alert system
6. **Documents** - Secure file management
7. **Fees** - Financial control dashboard
8. **Notifications** - Real-time alerts
9. **User Profile** - Photo upload and settings
10. **Security** - JWT authentication and RBAC

### 📊 API Documentation

Complete API documentation available at `/api/docs` when running the server.

### 📈 Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features:

- 🔄 Google Calendar integration
- 📧 Automated email system
- 📱 Mobile app (React Native)
- 🤖 Task automation
- 📊 Advanced PDF reports

### 🤝 Contributing

Contributions are welcome! Please follow our contributing guidelines.

### 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

### 👨‍💻 Developer

**Gedeon**
- Website: [Okapi Code Forge](https://okapi-code-forge.vercel.app/)

---

<div align="center">

**Made with ❤️ by [Gedeon](https://github.com/seu-usuario)**

⭐ Star this repo if you find it useful!

</div>
