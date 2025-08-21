import cron from 'node-cron';
import { YouTubeScraper } from './youtube-scraper';
import { db } from './db';
import ZAI from 'z-ai-web-dev-sdk';

export class ReportScheduler {
  private scraper: YouTubeScraper;
  private isRunning: boolean = false;

  constructor() {
    this.scraper = new YouTubeScraper();
  }

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting YouTube trends report scheduler...');

    // Executar relatório diário às 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily YouTube trends report...');
      await this.generateDailyReport();
    });

    // Executar busca por novos canais a cada 6 horas
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running trending channels search...');
      await this.searchTrendingChannels();
    });

    // Executar relatório semanal às segundas-feiras às 10:00 AM
    cron.schedule('0 10 * * 1', async () => {
      console.log('Running weekly YouTube analysis report...');
      await this.generateWeeklyReport();
    });

    console.log('Scheduler started successfully');
  }

  stop() {
    this.isRunning = false;
    console.log('Scheduler stopped');
  }

  private async generateDailyReport() {
    try {
      // Buscar canais recentes com alto engajamento
      const trendingChannels = await db.youTubeChannel.findMany({
        where: {
          isActive: true,
          country: 'US',
          subscriberCount: {
            gte: 1000
          },
          viewCount: {
            gte: 10000
          },
          publishedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
          }
        },
        orderBy: {
          subscriberCount: 'desc'
        },
        take: 20,
        include: {
          videos: {
            take: 5,
            orderBy: {
              viewCount: 'desc'
            }
          }
        }
      });

      if (trendingChannels.length === 0) {
        console.log('No trending channels found for daily report');
        return;
      }

      // Gerar insights usando IA
      let insights = null;
      try {
        const zai = await ZAI.create();
        
        const channelsData = trendingChannels.map(channel => ({
          title: channel.title,
          subscribers: channel.subscriberCount,
          views: channel.viewCount,
          videos: channel.videos.length,
          topVideos: channel.videos.map(video => ({
            title: video.title,
            views: video.viewCount,
            likes: video.likeCount
          }))
        }));

        const analysisPrompt = `
          Analise os seguintes canais do YouTube recentes (últimos 30 dias) dos EUA e forneça insights:
          
          ${JSON.stringify(channelsData, null, 2)}
          
          Forneça:
          1. Tendências principais entre esses canais
          2. Padrões de conteúdo que estão funcionando bem
          3. Insights sobre o que está gerando engajamento rápido
          4. Recomendações para monitoramento futuro
          
          Responda em português.
        `;

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Você é um analista especializado em tendências do YouTube e conteúdo viral.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ]
        });

        insights = completion.choices[0]?.message?.content;
      } catch (aiError) {
        console.error('Error generating AI insights:', aiError);
      }

      // Criar relatório diário
      const report = await db.dailyReport.create({
        data: {
          reportType: 'trending',
          title: `Relatório Diário de Tendências YouTube - ${new Date().toLocaleDateString('pt-BR')}`,
          summary: `Análise de ${trendingChannels.length} canais em alta dos últimos 30 dias nos EUA.`,
          insights,
          channelsData: JSON.stringify(trendingChannels),
          screenshotUrls: JSON.stringify(trendingChannels.map(c => c.thumbnailUrl).filter(Boolean))
        }
      });

      console.log(`Daily report generated successfully with ID: ${report.id}`);
    } catch (error) {
      console.error('Error generating daily report:', error);
    }
  }

  private async generateWeeklyReport() {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Buscar canais criados na última semana
      const newChannels = await db.youTubeChannel.findMany({
        where: {
          isActive: true,
          country: 'US',
          publishedAt: {
            gte: oneWeekAgo
          }
        },
        orderBy: {
          subscriberCount: 'desc'
        },
        take: 15,
        include: {
          videos: {
            take: 3,
            orderBy: {
              viewCount: 'desc'
            }
          }
        }
      });

      // Buscar vídeos em alta da última semana
      const trendingVideos = await db.youTubeVideo.findMany({
        where: {
          isActive: true,
          publishedAt: {
            gte: oneWeekAgo
          },
          viewCount: {
            gte: 50000
          }
        },
        orderBy: {
          viewCount: 'desc'
        },
        take: 10
      });

      // Gerar insights semanais
      let insights = null;
      try {
        const zai = await ZAI.create();
        
        const weeklyData = {
          newChannels: newChannels.map(c => ({
            title: c.title,
            subscribers: c.subscriberCount,
            views: c.viewCount
          })),
          trendingVideos: trendingVideos.map(v => ({
            title: v.title,
            views: v.viewCount,
            likes: v.likeCount
          }))
        };

        const analysisPrompt = `
          Analise os dados semanais do YouTube e forneça insights:
          
          Canais novos (última semana): ${JSON.stringify(weeklyData.newChannels, null, 2)}
          Vídeos em alta (última semana): ${JSON.stringify(weeklyData.trendingVideos, null, 2)}
          
          Forneça:
          1. Análise dos novos canais com melhor desempenho
          2. Padrões nos vídeos em alta
          3. Tendências de conteúdo da semana
          4. Previsões para a próxima semana
          
          Responda em português.
        `;

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Você é um analista especializado em tendências do YouTube e conteúdo viral.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ]
        });

        insights = completion.choices[0]?.message?.content;
      } catch (aiError) {
        console.error('Error generating weekly AI insights:', aiError);
      }

      // Criar relatório semanal
      const report = await db.dailyReport.create({
        data: {
          reportType: 'weekly',
          title: `Relatório Semanal YouTube - ${new Date().toLocaleDateString('pt-BR')}`,
          summary: `Análise semanal com ${newChannels.length} canais novos e ${trendingVideos.length} vídeos em alta.`,
          insights,
          channelsData: JSON.stringify(newChannels),
          videosData: JSON.stringify(trendingVideos),
          screenshotUrls: JSON.stringify(newChannels.map(c => c.thumbnailUrl).filter(Boolean))
        }
      });

      console.log(`Weekly report generated successfully with ID: ${report.id}`);
    } catch (error) {
      console.error('Error generating weekly report:', error);
    }
  }

  private async searchTrendingChannels() {
    try {
      const trendingChannels = await this.scraper.searchTrendingChannels(30, 1000, 10000);
      
      console.log(`Found ${trendingChannels.length} trending channels`);
      
      // Salvar canais encontrados no banco de dados
      for (const channel of trendingChannels) {
        await this.scraper.saveChannelToDB(channel);
      }
      
      console.log(`Saved ${trendingChannels.length} channels to database`);
    } catch (error) {
      console.error('Error searching trending channels:', error);
    } finally {
      await this.scraper.closeBrowser();
    }
  }

  // Método para executar manualmente a busca por canais
  async manualSearchTrendingChannels() {
    await this.searchTrendingChannels();
  }

  // Método para executar manualmente a geração de relatório
  async manualGenerateDailyReport() {
    await this.generateDailyReport();
  }
}