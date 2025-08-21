import { spawn, spawnSync } from 'child_process';

export interface YtDlpChannelInfo {
  id: string;
  title: string;
  description?: string;
  uploader?: string;
  uploaderId?: string;
  uploaderUrl?: string;
  channelUrl?: string;
  videoCount?: number;
  viewCount?: number;
  subscriberCount?: string;
}

export interface YtDlpVideoInfo {
  id: string;
  title: string;
  description?: string;
  uploader: string;
  uploaderId: string;
  uploaderUrl: string;
  duration?: number;
  viewCount: number;
  likeCount?: number;
  uploadDate?: string;
  thumbnailUrl?: string;
}

export class YtDlpWrapper {
  private ytDlpCommand: string;

  constructor(ytDlpPath?: string) {
    // Tentar encontrar o yt-dlp em vários locais
    const possiblePaths = [
      ytDlpPath,
      '/home/z/.local/bin/yt-dlp',
      'yt-dlp',
      '/usr/local/bin/yt-dlp',
      '/usr/bin/yt-dlp'
    ].filter(Boolean);
    
    // Encontrar o primeiro caminho que funciona
    for (const path of possiblePaths) {
      try {
        const testProcess = spawnSync(path, ['--version'], { 
          stdio: 'pipe',
          timeout: 5000 
        });
        if (testProcess.status === 0) {
          this.ytDlpCommand = path;
          console.log(`✅ yt-dlp found at: ${path}`);
          break;
        }
      } catch (error) {
        // Continuar para o próximo caminho
        console.log(`Testing path ${path}: ${error.message}`);
      }
    }
    
    if (!this.ytDlpCommand) {
      console.log('❌ yt-dlp not found in any standard location');
      this.ytDlpCommand = '/home/z/.local/bin/yt-dlp'; // Usar o caminho conhecido como fallback
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.executeCommand([ '--version' ]);
      return true;
    } catch (error) {
      console.log('yt-dlp not available:', error.message);
      return false;
    }
  }

  async getChannelInfo(channelUrl: string): Promise<YtDlpChannelInfo | null> {
    try {
      console.log(`Getting channel info with yt-dlp for: ${channelUrl}`);
      
      // Vamos tentar obter informações de um vídeo do canal
      const videoCommand = [
        '--flat-playlist',
        '--print', '%(title)s|%(uploader)s|%(uploader_id)s|%(uploader_url)s|%(channel)s',
        '--playlist-end', '1',
        '--no-download',
        '--ignore-errors',
        '--no-warnings',
        channelUrl
      ];

      const videoResult = await this.executeCommand(videoCommand);
      
      if (videoResult && videoResult.trim()) {
        const lines = videoResult.trim().split('\n');
        if (lines.length > 0) {
          const parts = lines[0].split('|');
          const title = parts[0] || '';
          const uploader = parts[1] || '';
          const uploaderId = parts[2] || '';
          const uploaderUrl = parts[3] || '';
          const channel = parts[4] || '';
          
          // Se o uploader for "NA" ou vazio, vamos tentar extrair do título ou usar um fallback
          let channelName = uploader;
          if (uploader === 'NA' || !uploader || uploader.trim() === '') {
            // Tentar extrair do ID do canal ou usar um nome genérico
            const channelIdMatch = channelUrl.match(/\/channel\/([^\/\?]+)/);
            if (channelIdMatch) {
              const channelId = channelIdMatch[1];
              channelName = `Channel ${channelId.substring(0, 8)}`;
            } else {
              channelName = 'Unknown Channel';
            }
          }
          
          console.log(`✅ Extracted channel name: "${channelName}" from uploader: "${uploader}"`);
          
          return {
            id: uploaderId,
            title: channelName,
            uploader: channelName,
            uploaderId: uploaderId,
            uploaderUrl: uploaderUrl,
            channelUrl: channelUrl
          };
        }
      }
      
      console.log('❌ No video data found with yt-dlp');
      return null;
    } catch (error) {
      console.error('❌ Error getting channel info with yt-dlp:', error.message);
      
      // Se for erro de autenticação, tentar um método alternativo
      if (error.message.includes('Sign in') || error.message.includes('bot') || error.message.includes('authentication')) {
        console.log('🔐 YouTube authentication required, trying alternative method...');
        return this.getChannelInfoAlternative(channelUrl);
      }
      
      return null;
    }
  }

  private async getChannelInfoAlternative(channelUrl: string): Promise<YtDlpChannelInfo | null> {
    try {
      // Tentar usar um formato diferente de extração
      const altCommand = [
        '--flat-playlist',
        '--print', '%(channel)s|%(uploader)s|%(uploader_id)s',
        '--playlist-end', '1',
        '--no-download',
        '--ignore-errors',
        '--no-warnings',
        channelUrl
      ];

      const altResult = await this.executeCommand(altCommand);
      
      if (altResult && altResult.trim()) {
        const lines = altResult.trim().split('\n');
        if (lines.length > 0) {
          const parts = lines[0].split('|');
          const channel = parts[0] || '';
          const uploader = parts[1] || '';
          const uploaderId = parts[2] || '';
          
          // Extrair channel ID da URL
          const channelIdMatch = channelUrl.match(/\/channel\/([^\/\?]+)/);
          const channelId = channelIdMatch ? channelIdMatch[1] : '';
          
          return {
            id: uploaderId || channelId,
            title: channel || uploader || `Channel ${channelId.substring(0, 8)}`,
            uploader: channel || uploader || `Channel ${channelId.substring(0, 8)}`,
            uploaderId: uploaderId || channelId,
            uploaderUrl: channelUrl,
            channelUrl: channelUrl
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Alternative method also failed:', error.message);
      return null;
    }
  }

  async getChannelVideos(channelUrl: string, maxVideos: number = 10): Promise<YtDlpVideoInfo[]> {
    try {
      console.log(`Getting channel videos with yt-dlp for: ${channelUrl}`);
      
      // Comando para extrair informações dos vídeos sem baixar
      const command = [
        '--flat-playlist',
        '--print', '%(id)s|%(title)s|%(uploader)s|%(uploader_id)s|%(uploader_url)s|%(duration)s|%(view_count)s|%(like_count)s|%(upload_date)s|%(thumbnail)s',
        '--playlist-end', maxVideos.toString(),
        '--no-download',
        '--ignore-errors',
        '--no-warnings',
        channelUrl
      ];

      const result = await this.executeCommand(command);
      const videos: YtDlpVideoInfo[] = [];
      
      if (result && result.trim()) {
        const lines = result.trim().split('\n');
        
        for (const line of lines) {
          const parts = line.split('|');
          if (parts.length >= 4) {
            videos.push({
              id: parts[0] || '',
              title: parts[1] || 'Unknown Video',
              uploader: parts[2] || '',
              uploaderId: parts[3] || '',
              uploaderUrl: parts[4] || '',
              duration: parts[5] ? parseInt(parts[5]) : undefined,
              viewCount: parseInt(parts[6] || '0'),
              likeCount: parts[7] ? parseInt(parts[7]) : undefined,
              uploadDate: parts[8] || '',
              thumbnailUrl: parts[9] || ''
            });
          }
        }
      }
      
      console.log(`✅ Found ${videos.length} videos with yt-dlp`);
      return videos.slice(0, maxVideos);
    } catch (error) {
      console.error('❌ Error getting channel videos with yt-dlp:', error.message);
      
      // Se for erro de autenticação, retornar array vazio em vez de falhar
      if (error.message.includes('Sign in') || error.message.includes('bot') || error.message.includes('authentication')) {
        console.log('🔐 YouTube authentication required for videos, skipping...');
        return [];
      }
      
      return [];
    }
  }

  async getChannelStats(channelUrl: string): Promise<{
    videoCount: number;
    totalViews: number;
    subscriberCount?: string;
  }> {
    try {
      console.log(`Getting channel stats with yt-dlp for: ${channelUrl}`);
      
      // Obter todos os vídeos para calcular estatísticas
      const videos = await this.getChannelVideos(channelUrl, 50); // Limitar para não demorar muito
      
      const videoCount = videos.length;
      const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
      
      // Tentar obter informação de inscritos (nem sempre disponível)
      let subscriberCount: string | undefined;
      try {
        const channelInfo = await this.getChannelInfo(channelUrl);
        if (channelInfo) {
          // Tentar obter inscritos de outras formas
          subscriberCount = await this.getSubscriberCount(channelUrl);
        }
      } catch (error) {
        console.log('Could not get subscriber count:', error.message);
      }
      
      return {
        videoCount,
        totalViews,
        subscriberCount
      };
    } catch (error) {
      console.error('Error getting channel stats with yt-dlp:', error);
      return {
        videoCount: 0,
        totalViews: 0
      };
    }
  }

  private async getSubscriberCount(channelUrl: string): Promise<string | undefined> {
    try {
      // Tentar extrair informação de inscritos usando um formato diferente
      const command = [
        '--flat-playlist',
        '--print', '%(channel)s',
        '--no-download',
        channelUrl
      ];

      await this.executeCommand(command);
      
      // Nota: yt-dlp não fornece facilmente contagem de inscritos
      // Esta é uma limitação conhecida
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private async executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
          const process = spawn(this.ytDlpCommand, args);
      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// Exportar instância única
export const ytDlpWrapper = new YtDlpWrapper();