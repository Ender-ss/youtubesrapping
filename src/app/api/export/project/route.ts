import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function GET(request: NextRequest) {
  try {
    // Create a temporary directory for the project export
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempDir = join(tmpdir(), `youtube-trends-export-${timestamp}`);
    
    // Copy project files to temp directory
    execSync(`mkdir -p "${tempDir}"`);
    execSync(`cp -r /home/z/my-project/* "${tempDir}/"`);
    
    // Remove node_modules and other unnecessary files
    execSync(`rm -rf "${tempDir}/node_modules"`);
    execSync(`rm -rf "${tempDir}/.next"`);
    execSync(`rm -rf "${tempDir}/.git"`);
    execSync(`rm -f "${tempDir}/dev.log"`);
    execSync(`rm -f "${tempDir}/server.log"`);
    execSync(`rm -f "${tempDir}/package-lock.json"`);
    
    // Create a README with export information
    const exportReadme = `# YouTube Trends Monitor - Exportado

Este projeto foi exportado em: ${new Date().toLocaleString('pt-BR')}

## Como usar este projeto

1. Extraia os arquivos do ZIP
2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`
3. Configure o banco de dados:
   \`\`\`bash
   npm run db:push
   \`\`\`
4. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

## Funcionalidades

- Busca automática de canais em alta do YouTube
- Filtros personalizados (país, idade do canal, inscritos, visualizações)
- Análise por IA para gerar relatórios
- Armazenamento de dados em banco de dados SQLite
- Interface web responsiva

## Tecnologias

- Next.js 15 com TypeScript
- Tailwind CSS e shadcn/ui
- Prisma ORM com SQLite
- YouTube Data API (ytdl-core, youtube-search-api)
- Z.AI SDK para análise por IA

## Notas

- Este é um projeto completo e funcional
- Todos os arquivos de configuração estão incluídos
- O banco de dados será recriado na primeira execução
- As configurações de filtros e IA são salvas no localStorage do navegador
`;

    await writeFile(join(tempDir, 'EXPORT_INFO.md'), exportReadme);
    
    // Create ZIP file
    const zipPath = join(tmpdir(), `youtube-trends-monitor-${timestamp}.zip`);
    execSync(`cd "${tempDir}/.." && zip -r "${zipPath}" "youtube-trends-export-${timestamp}"`);
    
    // Read the ZIP file
    const zipBuffer = await readFile(zipPath);
    
    // Clean up temporary files
    execSync(`rm -rf "${tempDir}"`);
    execSync(`rm -f "${zipPath}"`);
    
    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="youtube-trends-monitor-${timestamp}.zip"`,
      },
    });
    
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    );
  }
}