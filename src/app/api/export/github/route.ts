import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

interface GithubSettings {
  username: string;
  repoName: string;
  token: string;
  repoUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, repoName, token }: GithubSettings = await request.json();
    
    if (!username || !repoName || !token) {
      return NextResponse.json(
        { error: 'Configurações do GitHub incompletas. Preencha todos os campos.' },
        { status: 400 }
      );
    }

    // Create a temporary directory for git operations
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempDir = join(tmpdir(), `github-export-${timestamp}`);
    
    try {
      // Copy project files to temp directory
      execSync(`mkdir -p "${tempDir}"`);
      execSync(`cp -r /home/z/my-project/* "${tempDir}/"`);
      
      // Remove unnecessary files
      execSync(`rm -rf "${tempDir}/node_modules"`);
      execSync(`rm -rf "${tempDir}/.next"`);
      execSync(`rm -rf "${tempDir}/.git"`);
      execSync(`rm -f "${tempDir}/dev.log"`);
      execSync(`rm -f "${tempDir}/server.log"`);
      execSync(`rm -f "${tempDir}/package-lock.json"`);
      
      // Initialize git repository
      execSync(`cd "${tempDir}" && git init`);
      execSync(`cd "${tempDir}" && git config user.name "YouTube Trends Monitor"`);
      execSync(`cd "${tempDir}" && git config user.email "noreply@youtube-trends-monitor.com"`);
      
      // Create .gitignore
      const gitignore = `# Dependencies
node_modules/
package-lock.json

# Next.js
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log
dev.log
server.log

# Database
*.db
*.sqlite
*.sqlite3

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

      await writeFile(join(tempDir, '.gitignore'), gitignore);
      
      // Create README with GitHub information
      const readme = `# YouTube Trends Monitor

Sistema de monitoramento de canais em alta do YouTube com análise por IA.

## 🚀 Funcionalidades

- ✅ Busca automática de canais em alta do YouTube
- ✅ Filtros personalizados (país, idade do canal, inscritos, visualizações)
- ✅ Análise por IA para gerar relatórios e insights
- ✅ Armazenamento de dados em banco de dados SQLite
- ✅ Interface web responsiva e moderna
- ✅ Exportação de dados e relatórios
- ✅ Agendamento de buscas automáticas

## 🛠️ Tecnologias

- **Frontend**: Next.js 15 com TypeScript
- **Estilização**: Tailwind CSS e shadcn/ui
- **Banco de Dados**: Prisma ORM com SQLite
- **YouTube API**: ytdl-core, youtube-search-api
- **IA**: Z.AI SDK para análise inteligente
- **Real-time**: Socket.io para atualizações ao vivo

## 📦 Instalação

1. Clone este repositório
   \`\`\`bash
   git clone https://github.com/${username}/${repoName}.git
   cd ${repoName}
   \`\`\`

2. Instale as dependências
   \`\`\`bash
   npm install
   \`\`\`

3. Configure o banco de dados
   \`\`\`bash
   npm run db:push
   \`\`\`

4. Inicie o servidor de desenvolvimento
   \`\`\`bash
   npm run dev
   \`\`\`

5. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🎯 Como usar

### Busca Automática
1. Clique em "Buscar Canais em Alta" para encontrar canais novos e populares
2. Configure os filtros para refinar sua busca
3. O sistema aplicará filtros de idade, inscritos e visualizações

### Filtros Disponíveis
- **Idade Máxima**: Canais criados nos últimos X dias
- **Inscritos Mínimos**: Número mínimo de inscritos
- **Visualizações Mínimas**: Número mínimo de visualizações totais
- **País**: Focar em canais de um país específico
- **Palavras-chave**: Buscar por termos específicos

### Análise por IA
1. Configure as configurações de IA (Z.AI, Gemini ou OpenAI)
2. Gere relatórios automáticos com insights
3. Obtenha análise de tendências e recomendações

### Exportação
- **Baixar Projeto**: Exporte o projeto completo como ZIP
- **Relatórios**: Gere e baixe relatórios em diversos formatos

## 📊 Estrutura do Projeto

\`\`\`
src/
├── app/
│   ├── api/          # API routes
│   ├── layout.tsx    # Layout principal
│   └── page.tsx      # Página principal
├── components/
│   └── ui/           # Componentes shadcn/ui
├── lib/              # Bibliotecas e utilitários
│   ├── db.ts         # Configuração do banco de dados
│   ├── ai-service.ts # Serviço de IA
│   └── youtube-scraper.ts # Serviço do YouTube
└── hooks/            # Hooks personalizados
\`\`\`

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo \`.env\` na raiz do projeto:

\`\`\`env
# Database
DATABASE_URL="file:./dev.db"

# AI Settings (opcional)
OPENAI_API_KEY="your-openai-key"
GEMINI_API_KEY="your-gemini-key"
\`\`\`

### Configurações de IA
O sistema suporta múltiplos provedores de IA:
- **Z.AI**: Integrado por padrão
- **Google Gemini**: Para análise avançada
- **OpenAI**: Para modelos GPT

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Prisma](https://prisma.io/) - ORM
- [YouTube API](https://developers.google.com/youtube) - Dados do YouTube

---

⭐ Se este projeto foi útil para você, por favor considere dar uma estrela!
`;

      await writeFile(join(tempDir, 'README.md'), readme);
      
      // Add all files to git
      execSync(`cd "${tempDir}" && git add .`);
      execSync(`cd "${tempDir}" && git commit -m "Initial commit: YouTube Trends Monitor

🚀 Sistema completo de monitoramento de canais em alta do YouTube

✅ Funcionalidades:
- Busca automática de canais em alta
- Filtros personalizados (país, idade, inscritos, visualizações)
- Análise por IA para relatórios e insights
- Interface web responsiva
- Exportação de dados

🛠️ Tecnologias:
- Next.js 15 com TypeScript
- Tailwind CSS e shadcn/ui
- Prisma ORM com SQLite
- YouTube Data API
- Z.AI SDK

📦 Projeto exportado em: ${new Date().toLocaleString('pt-BR')}"`);
      
      // Create GitHub repository
      const repoFullName = `${username}/${repoName}`;
      const createRepoUrl = `https://api.github.com/user/repos`;
      
      // Check if repository exists first
      const checkRepoUrl = `https://api.github.com/repos/${repoFullName}`;
      const checkRepoResponse = await fetch(checkRepoUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'YouTube-Trends-Monitor'
        },
      });
      
      let repoExists = checkRepoResponse.ok;
      
      if (!repoExists) {
        // Try to create the repository
        const createRepoResponse = await fetch(createRepoUrl, {
          method: 'POST',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'YouTube-Trends-Monitor'
          },
          body: JSON.stringify({
            name: repoName,
            description: 'Sistema de monitoramento de canais em alta do YouTube com análise por IA',
            private: false,
            auto_init: false,
          }),
        });
        
        if (!createRepoResponse.ok) {
          const errorData = await createRepoResponse.json();
          throw new Error(`Falha ao criar repositório: ${errorData.message || createRepoResponse.statusText}`);
        }
        
        repoExists = true;
      }
      
      // Add remote and push
      const remoteUrl = `https://${token}@github.com/${repoFullName}.git`;
      execSync(`cd "${tempDir}" && git remote add origin "${remoteUrl}"`);
      
      // Try to push to main branch first
      try {
        execSync(`cd "${tempDir}" && git push -u origin main --force`);
      } catch (pushError) {
        // If main fails, try master
        try {
          execSync(`cd "${tempDir}" && git push -u origin master --force`);
        } catch (masterError) {
          throw new Error('Falha ao fazer push para o GitHub. Verifique se o token tem permissões de repo.');
        }
      }
      
      // Clean up temporary files
      execSync(`rm -rf "${tempDir}"`);
      
      return NextResponse.json({
        success: true,
        message: 'Projeto enviado para GitHub com sucesso!',
        repoUrl: `https://github.com/${repoFullName}`,
      });
      
    } catch (error) {
      // Clean up temporary files even if there's an error
      try {
        execSync(`rm -rf "${tempDir}"`);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary files:', cleanupError);
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    return NextResponse.json(
      { error: `Falha ao enviar para GitHub: ${error.message}` },
      { status: 500 }
    );
  }
}