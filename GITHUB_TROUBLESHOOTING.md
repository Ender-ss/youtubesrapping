# 🛠️ Solução de Problemas - GitHub Integration

## ❌ Erros Comuns e Soluções

### 1. "Falha ao enviar para GitHub"

#### Possíveis Causas e Soluções:

#### 🔑 Problema: Token Inválido ou Sem Permissões
**Sintoma:** Erro mencionando "token" ou "permissões"

**Solução:**
1. Verifique se o token começa com `ghp_` ou `gho_`
2. Acesse [github.com/settings/tokens](https://github.com/settings/tokens)
3. Crie um novo token com as seguintes permissões:
   - ✅ `repo` (controle total de repositórios privados)
   - ✅ `workflow` (atualizar arquivos de workflow do GitHub Actions)
4. Copie o token imediatamente (ele não será exibido novamente)

#### 👤 Problema: Nome de Usuário Incorreto
**Sintoma:** Erro 404 ou "usuário não encontrado"

**Solução:**
1. Verifique seu nome de usuário do GitHub em [github.com](https://github.com)
2. O nome de usuário é case-sensitive (ex: "JoaoSilva" é diferente de "joaosilva")
3. Use exatamente o mesmo nome que aparece na URL do seu perfil

#### 📁 Problema: Repositório Já Existe
**Sintoma:** Erro 422 ou "repositório já existe"

**Solução:**
1. O sistema deve lidar com isso automaticamente, mas se falhar:
2. Verifique se o repositório já existe em `github.com/[seu-usuario]/[nome-repositorio]`
3. Se existir, tente usar um nome diferente para o repositório

#### 🌐 Problema: Conexão ou Firewall
**Sintoma:** Erro de timeout ou conexão

**Solução:**
1. Verifique sua conexão com a internet
2. Tente acessar [github.com](https://github.com) no navegador
3. Se estiver atrás de um firewall corporativo, pode precisar de permissões especiais

### 2. "Falha ao criar repositório"

#### 🔍 Problema: Limite de Repositórios
**Sintoma:** Erro sobre limites ou quotas

**Solução:**
1. Verifique quantos repositórios você já criou
2. Contas gratuitas têm limites (geralmente ilimitados para repositórios públicos)
3. Se atingiu o limite, exclua alguns repositórios não utilizados

#### 📝 Problema: Nome de Repositório Inválido
**Sintoma:** Erro de validação de nome

**Solução:**
1. Use apenas letras, números, hífens e sublinhados
2. Não comece com hífen
3. Evite nomes muito longos (máximo 100 caracteres)
4. Exemplos válidos: `youtube-monitor`, `youtube_trends`, `my-youtube-project`

### 3. "Falha ao fazer push para o GitHub"

#### 🌿 Problema: Branch Padrão
**Sintoma:** Erro sobre branch não encontrada

**Solução:**
O sistema agora tenta automaticamente ambos os nomes de branch:
- `main` (padrão moderno)
- `master` (padrão antigo)

Se ainda falhar, pode ser um problema de configuração do Git.

#### 🔐 Problema: Autenticação
**Sintoma:** Erro 401 ou "não autorizado"

**Solução:**
1. Verifique se o token ainda é válido
2. Tokens expiram após 1 ano (para tokens clássicos)
3. Revogue tokens antigos e crie um novo

## 📋 Passo a Passo Detalhado

### 1. Criar um GitHub Token Corretamente

1. **Acesse as configurações de tokens**
   - Vá para [github.com/settings/tokens](https://github.com/settings/tokens)
   - Faça login se necessário

2. **Crie um novo token**
   - Clique em "Generate new token" → "Generate new token (classic)"
   - Dê um nome descritivo: "YouTube Trends Monitor"

3. **Configure as permissões**
   - Marque ✅ `repo` (isso inclui: repo:status, repo_deployment, public_repo, repo:invite)
   - Marque ✅ `workflow` (para GitHub Actions)
   - Deixe as outras opções desmarcadas

4. **Defina a expiração**
   - Escolha um período (ex: 90 dias ou sem expiração)
   - Anote a data de expiração

5. **Gere e copie o token**
   - Clique em "Generate token"
   - **Copie o token imediatamente** (ele não será exibido novamente)
   - O token deve começar com `ghp_`

### 2. Configurar o Sistema

1. **Preencha o formulário corretamente:**
   - **Usuário**: Seu nome de usuário exato do GitHub
   - **Repositório**: Nome desejado para o repositório (ex: `youtube-trends-monitor`)
   - **Token**: O token copiado (começando com `ghp_`)

2. **Salve as configurações**
   - Clique em "Salvar Configurações"
   - Isso armazena as configurações no navegador

3. **Envie para o GitHub**
   - Clique em "Enviar para GitHub"
   - Aguarde o processo completar (pode levar alguns minutos)

## 🔧 Diagnóstico Avançado

### Verificar Manualmente

Se o sistema automático falhar, você pode fazer o processo manualmente:

1. **Baixe o projeto** usando o botão "Baixar Projeto"
2. **Extraia o ZIP** em uma pasta
3. **Abra o terminal** na pasta extraída
4. **Execute os comandos manualmente:**

```bash
# Inicializar repositório Git
git init

# Configurar usuário
git config user.name "Seu Nome"
git config user.email "seu@email.com"

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Initial commit: YouTube Trends Monitor"

# Adicionar remote
git remote add origin https://github.com/seu-usuario/seu-repositorio.git

# Enviar para GitHub
git push -u origin main
```

### Testar Conexão com GitHub

Para testar se seu token funciona:

```bash
# No terminal, substitua SEU_TOKEN pelo seu token real
curl -H "Authorization: token SEU_TOKEN" https://api.github.com/user
```

Se retornar informações do seu usuário, o token está correto.

## 📞 Suporte

Se ainda tiver problemas:

1. **Verifique o console do navegador** para erros detalhados
2. **Tente com um repositório de teste** primeiro
3. **Verifique as configurações de rede** e firewall
4. **Tente usar uma rede diferente** se estiver em rede corporativa

## 🎯 Dicas Finais

- **Sempre use tokens recentes** - tokens antigos podem expirar
- **Verifique o nome de usuário** - é case-sensitive
- **Use nomes de repositório simples** - evite caracteres especiais
- **Teste com um repositório de teste** antes de usar o nome final
- **Mantenha seu token seguro** - não compartilhe com ninguém

---

Se seguir estes passos, o envio para o GitHub deve funcionar corretamente! 🚀