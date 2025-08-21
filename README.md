# YouTube Trends Monitor

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
   ```bash
   git clone https://github.com/Ender-ss/youtubesrapping.git
   cd youtubesrapping
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure o banco de dados
   ```bash
   npm run db:push
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   ```

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

```
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
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="file:./dev.db"

# AI Settings (opcional)
OPENAI_API_KEY="your-openai-key"
GEMINI_API_KEY="your-gemini-key"
```

### Configurações de IA
O sistema suporta múltiplos provedores de IA:
- **Z.AI**: Integrado por padrão
- **Google Gemini**: Para análise avançada
- **OpenAI**: Para modelos GPT

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
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
