import ZAI from 'z-ai-web-dev-sdk';
import { db } from './db';

export interface AnalysisResult {
  trends: string[];
  contentPatterns: string[];
  engagementInsights: string[];
  recommendations: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  viralityScore: number;
}

export class AIService {
  private zai: any = null;

  async initialize() {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
    return this.zai;
  }

  async analyzeChannelTrends(channels: any[]): Promise<AnalysisResult> {
    try {
      const zai = await this.initialize();
      
      const channelsData = channels.map(channel => ({
        title: channel.title,
        subscribers: channel.subscriberCount,
        views: channel.viewCount,
        videos: channel.videoCount,
        description: channel.description,
        publishedAt: channel.publishedAt,
        topVideos: channel.videos?.map((video: any) => ({
          title: video.title,
          views: video.viewCount,
          likes: video.likeCount,
          comments: video.commentCount,
          description: video.description
        })) || []
      }));

      const analysisPrompt = `
        Analise os seguintes canais do YouTube recentes dos EUA e forneça insights detalhados:
        
        Dados dos canais:
        ${JSON.stringify(channelsData, null, 2)}
        
        Por favor, forneça uma análise completa em formato JSON com as seguintes seções:
        
        1. trends: Array de strings com as principais tendências identificadas
        2. contentPatterns: Array de strings com padrões de conteúdo que estão funcionando bem
        3. engagementInsights: Array de strings com insights sobre o que está gerando engajamento rápido
        4. recommendations: Array de strings com recomendações para monitoramento futuro
        5. sentiment: String com 'positive', 'neutral' ou 'negative' baseado no sentimento geral
        6. viralityScore: Número de 0 a 100 indicando o potencial de viralidade desses canais
        
        Responda apenas com o JSON válido, sem texto adicional.
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um analista especializado em tendências do YouTube e conteúdo viral. Responda sempre com JSON válido.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      
      try {
        const parsed = JSON.parse(response || '{}');
        return {
          trends: parsed.trends || [],
          contentPatterns: parsed.contentPatterns || [],
          engagementInsights: parsed.engagementInsights || [],
          recommendations: parsed.recommendations || [],
          sentiment: parsed.sentiment || 'neutral',
          viralityScore: parsed.viralityScore || 50
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.getFallbackAnalysis();
      }
    } catch (error) {
      console.error('Error analyzing channel trends:', error);
      return this.getFallbackAnalysis();
    }
  }

  async analyzeVideoContent(video: any): Promise<{
    summary: string;
    keyTopics: string[];
    sentiment: string;
    engagementPrediction: number;
    recommendations: string[];
  }> {
    try {
      const zai = await this.initialize();
      
      const videoData = {
        title: video.title,
        description: video.description,
        views: video.viewCount,
        likes: video.likeCount,
        comments: video.commentCount,
        duration: video.duration,
        tags: video.tags ? JSON.parse(video.tags) : []
      };

      const analysisPrompt = `
        Analise o seguinte vídeo do YouTube e forneça insights:
        
        Dados do vídeo:
        ${JSON.stringify(videoData, null, 2)}
        
        Forneça uma análise completa em formato JSON com:
        1. summary: Resumo conciso do conteúdo do vídeo
        2. keyTopics: Array de tópicos principais abordados
        3. sentiment: 'positive', 'neutral' ou 'negative'
        4. engagementPrediction: Número de 0 a 100 prevendo engajamento futuro
        5. recommendations: Array de recomendações para melhorar o desempenho
        
        Responda apenas com JSON válido.
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um analista de conteúdo do YouTube especializado em otimização e tendências.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      
      try {
        return JSON.parse(response || '{}');
      } catch (parseError) {
        console.error('Error parsing video analysis:', parseError);
        return this.getFallbackVideoAnalysis();
      }
    } catch (error) {
      console.error('Error analyzing video content:', error);
      return this.getFallbackVideoAnalysis();
    }
  }

  async generateChannelReport(channel: any): Promise<{
    overview: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    growthPotential: number;
    recommendations: string[];
  }> {
    try {
      const zai = await this.initialize();
      
      const channelData = {
        title: channel.title,
        description: channel.description,
        subscribers: channel.subscriberCount,
        views: channel.viewCount,
        videos: channel.videoCount,
        publishedAt: channel.publishedAt,
        topVideos: channel.videos?.map((video: any) => ({
          title: video.title,
          views: video.viewCount,
          likes: video.likeCount,
          comments: video.commentCount
        })) || []
      };

      const analysisPrompt = `
        Realize uma análise SWOT completa do seguinte canal do YouTube:
        
        Dados do canal:
        ${JSON.stringify(channelData, null, 2)}
        
        Forneça uma análise SWOT em formato JSON com:
        1. overview: Visão geral do canal
        2. strengths: Array de pontos fortes
        3. weaknesses: Array de pontos fracos
        4. opportunities: Array de oportunidades
        5. threats: Array de ameaças
        6. growthPotential: Número de 0 a 100 indicando potencial de crescimento
        7. recommendations: Array de recomendações estratégicas
        
        Responda apenas com JSON válido.
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor especializado em estratégia de canais do YouTube.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      
      try {
        return JSON.parse(response || '{}');
      } catch (parseError) {
        console.error('Error parsing channel report:', parseError);
        return this.getFallbackChannelReport();
      }
    } catch (error) {
      console.error('Error generating channel report:', error);
      return this.getFallbackChannelReport();
    }
  }

  async searchWebForTrends(query: string): Promise<any[]> {
    try {
      const zai = await this.initialize();
      
      const searchResult = await zai.functions.invoke("web_search", {
        query: query,
        num: 10
      });

      return searchResult || [];
    } catch (error) {
      console.error('Error searching web for trends:', error);
      return [];
    }
  }

  private getFallbackAnalysis(): AnalysisResult {
    return {
      trends: ['Análise temporariamente indisponível'],
      contentPatterns: ['Aguardando mais dados para análise'],
      engagementInsights: ['Análise em andamento'],
      recommendations: ['Continue monitorando os canais regularmente'],
      sentiment: 'neutral',
      viralityScore: 50
    };
  }

  private getFallbackVideoAnalysis() {
    return {
      summary: 'Análise do vídeo temporariamente indisponível',
      keyTopics: ['Aguardando processamento'],
      sentiment: 'neutral',
      engagementPrediction: 50,
      recommendations: ['Verifique os dados do vídeo novamente']
    };
  }

  private getFallbackChannelReport() {
    return {
      overview: 'Análise do canal temporariamente indisponível',
      strengths: ['Aguardando mais dados'],
      weaknesses: ['Análise em andamento'],
      opportunities: ['Potencial a ser explorado'],
      threats: ['Monitorar concorrência'],
      growthPotential: 50,
      recommendations: ['Continue monitorando o canal']
    };
  }
}

export const aiService = new AIService();