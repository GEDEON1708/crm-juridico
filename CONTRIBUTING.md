# Contributing to CRM Jurídico

Obrigado pelo seu interesse em contribuir com o CRM Jurídico! 🎉

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/seu-usuario/crm-juridico/issues)
2. Se não encontrar, [abra uma nova issue](https://github.com/seu-usuario/crm-juridico/issues/new) usando o template de Bug Report
3. Inclua o máximo de detalhes possível:
   - Passos para reproduzir
   - Comportamento esperado vs comportamento atual
   - Screenshots se aplicável
   - Informações do ambiente (SO, navegador, versão do Node.js)

### Sugerindo Melhorias

1. [Abra uma issue](https://github.com/seu-usuario/crm-juridico/issues/new) usando o template de Feature Request
2. Descreva claramente a funcionalidade desejada
3. Explique por que ela seria útil
4. Se possível, sugira uma implementação

### Pull Requests

1. **Fork** o repositório
2. **Clone** o seu fork
   ```bash
   git clone https://github.com/seu-usuario/crm-juridico.git
   cd crm-juridico
   ```

3. **Crie uma branch** para sua feature/fix
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/meu-fix
   ```

4. **Configure o ambiente**
   ```bash
   # Backend
   cd backend
   npm install
   npm run prisma:migrate
   
   # Frontend
   cd ../frontend
   npm install
   ```

5. **Faça suas alterações**
   - Escreva código limpo e bem documentado
   - Siga os padrões de código do projeto
   - Adicione testes se aplicável
   - Atualize a documentação se necessário

6. **Teste suas alterações**
   ```bash
   # Backend
   npm run build
   npm test
   
   # Frontend
   npm run build
   npm run lint
   ```

7. **Commit suas mudanças**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   ```

   Use commits semânticos:
   - `feat:` - Nova funcionalidade
   - `fix:` - Correção de bug
   - `docs:` - Documentação
   - `style:` - Formatação
   - `refactor:` - Refatoração
   - `test:` - Testes
   - `chore:` - Manutenção

8. **Push para seu fork**
   ```bash
   git push origin feature/minha-feature
   ```

9. **Abra um Pull Request**
   - Vá para o repositório original
   - Clique em "New Pull Request"
   - Selecione sua branch
   - Preencha o template de PR
   - Aguarde a revisão

### Padrões de Código

#### TypeScript
- Use TypeScript para type safety
- Evite `any`, prefira tipos específicos
- Documente funções complexas com JSDoc

#### React
- Use componentes funcionais com hooks
- Mantenha componentes pequenos e reutilizáveis
- Use `React.memo()` para otimização quando necessário

#### Node.js/Express
- Use async/await ao invés de callbacks
- Trate erros adequadamente
- Valide inputs com Joi

#### Estilo
- Use Prettier para formatação automática
- Siga as regras do ESLint
- Indentação: 2 espaços
- Use single quotes para strings

### Estrutura de Commits

```
tipo(escopo): descrição curta

Descrição mais detalhada se necessário.

Fixes #123
```

Exemplo:
```
feat(clientes): adiciona filtro por status

Implementa filtro dropdown na listagem de clientes
permitindo filtrar por status ativo/inativo.

Fixes #45
```

### Testes

- Escreva testes para novas funcionalidades
- Garanta que todos os testes existentes passam
- Mantenha cobertura de teste acima de 80%

```bash
# Backend
npm test
npm run test:coverage

# Frontend
npm test
```

### Documentação

- Atualize o README.md se necessário
- Documente novas rotas da API
- Adicione comentários em código complexo
- Atualize o ROADMAP.md para features implementadas

### Code Review

Todos os Pull Requests passam por code review. O processo inclui:

1. **Checklist Automático**
   - Build bem-sucedido
   - Testes passando
   - Lint sem erros
   - Cobertura de teste mantida

2. **Revisão Manual**
   - Código limpo e legível
   - Segue os padrões do projeto
   - Documentação adequada
   - Sem breaking changes não documentados

3. **Aprovação**
   - Pelo menos 1 aprovação de mantenedor
   - Todos os comentários resolvidos
   - CI/CD passando

### Dúvidas?

- Abra uma [Discussion](https://github.com/seu-usuario/crm-juridico/discussions)
- Entre em contato via [Issues](https://github.com/seu-usuario/crm-juridico/issues)

## Código de Conduta

### Nossa Promessa

Nós, como membros, contribuidores e líderes, nos comprometemos a tornar a participação em nossa comunidade uma experiência livre de assédio para todos.

### Comportamento Esperado

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista diferentes
- Aceite críticas construtivas graciosamente
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

### Comportamento Inaceitável

- Linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos/depreciativos
- Assédio público ou privado
- Publicar informações privadas de outros
- Outras condutas não profissionais

### Aplicação

Instâncias de comportamento inaceitável podem ser reportadas aos mantenedores do projeto. Todas as reclamações serão revisadas e investigadas.

## Reconhecimento

Contribuidores serão listados no arquivo CONTRIBUTORS.md.

---

**Obrigado por contribuir!** ❤️
