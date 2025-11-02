# Preparação para Envio ao GitHub

Este documento guia você através do processo de envio do projeto para o GitHub.

## Pré-requisitos

1. ✅ Git instalado
2. ✅ Conta no GitHub
3. ✅ Git configurado com suas credenciais

## Configuração Inicial do Git

Se ainda não configurou o Git, execute:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

## Passos para Envio

### 1. Inicializar Repositório Local

```bash
cd "c:\Users\Gedeon\Desktop\Project DevWeb\crm-juridico"
git init
```

### 2. Adicionar Arquivos

```bash
git add .
```

### 3. Fazer Commit Inicial

```bash
git commit -m "feat: implementação inicial do CRM Jurídico

- Sistema completo de gestão para escritórios de advocacia
- Backend em Node.js + TypeScript + Express + Prisma
- Frontend em React + TypeScript + Vite + Tailwind
- Autenticação JWT com controle de acesso
- Dashboard com estatísticas e gráficos
- Gestão de clientes, casos, prazos e documentos
- Sistema de notificações em tempo real
- Upload de arquivos e fotos de perfil
- Documentação completa
- Scripts de automação para Windows

Desenvolvido por: Gedeon
Website: https://okapi-code-forge.vercel.app/"
```

### 4. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em "New repository"
3. Nome: `crm-juridico`
4. Descrição: `Sistema completo de gestão para escritórios de advocacia`
5. **NÃO** marque "Initialize with README" (já temos)
6. Clique em "Create repository"

### 5. Conectar ao Repositório Remoto

```bash
git remote add origin https://github.com/SEU-USUARIO/crm-juridico.git
```

**Substitua `SEU-USUARIO` pelo seu usuário do GitHub!**

### 6. Criar Branch Principal

```bash
git branch -M main
```

### 7. Fazer Push

```bash
git push -u origin main
```

### 8. Verificar Upload

Acesse: `https://github.com/SEU-USUARIO/crm-juridico`

## Configurações Recomendadas no GitHub

### 1. Sobre o Repositório

Vá em "About" (canto direito superior) e configure:

- **Description:** Sistema completo de gestão para escritórios de advocacia
- **Website:** https://okapi-code-forge.vercel.app/
- **Topics:** `crm`, `juridico`, `advocacia`, `typescript`, `react`, `nodejs`, `prisma`, `postgresql`, `express`, `tailwindcss`, `law-firm`, `case-management`

### 2. Proteção da Branch Main

1. Vá em Settings > Branches
2. Add rule para `main`
3. Marque:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging

### 3. Issues e Projects

1. Vá em Settings
2. Habilite:
   - ✅ Issues
   - ✅ Projects
   - ✅ Discussions (opcional)

### 4. GitHub Pages (Documentação)

1. Settings > Pages
2. Source: Deploy from branch
3. Branch: `main`
4. Folder: `/docs`

## Deploy no Vercel

### Backend

1. Acesse [Vercel](https://vercel.com)
2. Import repositório
3. Configure:
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Variáveis de ambiente:
   ```
   DATABASE_URL=sua_url_postgresql
   JWT_SECRET=seu_jwt_secret
   JWT_REFRESH_SECRET=seu_refresh_secret
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```

### Frontend

1. Import o mesmo repositório
2. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. Variáveis de ambiente:
   ```
   VITE_API_URL=https://seu-backend.vercel.app/api
   ```

## Verificação Final

Antes do push, verifique:

- [ ] README.md completo e atualizado
- [ ] LICENSE presente
- [ ] .gitignore configurado
- [ ] .gitattributes configurado
- [ ] CONTRIBUTING.md presente
- [ ] Issue templates criados
- [ ] Documentação completa na pasta docs/
- [ ] ROADMAP.md atualizado
- [ ] Código sem erros de compilação
- [ ] Testes passando (se houver)
- [ ] Variáveis sensíveis removidas (.env no .gitignore)

## Comandos Git Úteis

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Atualizar do remoto
git pull origin main

# Ver remotos configurados
git remote -v

# Adicionar arquivos específicos
git add arquivo.ts

# Desfazer mudanças
git checkout -- arquivo.ts

# Ver diferenças
git diff
```

## Dicas

### Commits Semânticos

Use prefixos nos commits:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

### Mensagens de Commit

✅ **Bom:**
```
feat(clientes): adiciona filtro por status

Implementa dropdown na listagem de clientes
permitindo filtrar por ativo/inativo.

Fixes #123
```

❌ **Ruim:**
```
mudanças
```

### Ignorar Arquivos

Se esqueceu de adicionar algo no .gitignore:

```bash
# Remover do staging
git rm --cached arquivo_ou_pasta

# Ou remover diretório
git rm -r --cached node_modules/

# Commit a remoção
git commit -m "chore: remove arquivos desnecessários"
```

## Problemas Comuns

### "Permission denied"

Solução: Configure SSH keys ou use HTTPS com token

### "Large files"

GitHub tem limite de 100MB por arquivo. Para arquivos grandes, use Git LFS:

```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
```

### "Merge conflicts"

```bash
# Atualizar local
git pull origin main

# Resolver conflitos manualmente
# Depois:
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

## Suporte

- 📖 [Documentação Git](https://git-scm.com/doc)
- 📖 [GitHub Docs](https://docs.github.com)
- 📖 [Vercel Docs](https://vercel.com/docs)

## Checklist Final ✅

Antes de fazer o primeiro push:

- [ ] Código testado e funcionando
- [ ] Documentação completa
- [ ] .env.example criados (sem valores reais)
- [ ] README atualizado com seu usuário GitHub
- [ ] LICENSE com seu nome
- [ ] Todos os arquivos importantes commitados
- [ ] .gitignore impede envio de node_modules/
- [ ] Sem senhas ou tokens no código

## Pronto!

Após seguir todos os passos, seu projeto estará no GitHub! 🎉

**Link do repositório:** https://github.com/SEU-USUARIO/crm-juridico

Não esqueça de:
1. Adicionar uma estrela (⭐) no seu próprio repo
2. Compartilhar com a comunidade
3. Continuar desenvolvendo seguindo o ROADMAP.md

---

**Desenvolvido por:** Gedeon  
**Website:** [Okapi Code Forge](https://okapi-code-forge.vercel.app/)
