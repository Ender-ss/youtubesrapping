import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const reportType = searchParams.get('reportType') || 'all';
    const userId = searchParams.get('userId');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (reportType !== 'all') {
      whereClause.reportType = reportType;
    }
    if (userId) {
      whereClause.userId = userId;
    }

    const [reports, totalCount] = await Promise.all([
      db.dailyReport.findMany({
        where: whereClause,
        orderBy: {
          reportDate: 'desc'
        },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          channel: {
            select: {
              id: true,
              channelId: true,
              title: true,
              thumbnailUrl: true
            }
          }
        }
      }),
      db.dailyReport.count({
        where: whereClause
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reportType, userId, channelId, title, summary } = await request.json();

    if (!reportType || !title || !summary) {
      return NextResponse.json({ error: 'Report type, title, and summary are required' }, { status: 400 });
    }

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
      take: 10,
      include: {
        videos: {
          take: 3,
          orderBy: {
            viewCount: 'desc'
          }
        }
      }
    });

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

    // Criar relatório
    const report = await db.dailyReport.create({
      data: {
        userId,
        channelId,
        reportType,
        title,
        summary,
        insights,
        channelsData: JSON.stringify(trendingChannels),
        screenshotUrls: JSON.stringify(trendingChannels.map(c => c.thumbnailUrl).filter(Boolean))
      }
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}