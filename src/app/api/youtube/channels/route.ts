import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minSubscribers = parseInt(searchParams.get('minSubscribers') || '0');
    const minViews = parseInt(searchParams.get('minViews') || '0');
    const maxAgeDays = parseInt(searchParams.get('maxAgeDays') || '30');
    const country = searchParams.get('country') || 'US';

    const offset = (page - 1) * limit;

    // Calcular data máxima para canais recentes
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - maxAgeDays);

    // Construir cláusula where dinamicamente
    const whereClause: any = {
      isActive: true,
      country,
      subscriberCount: {
        gte: minSubscribers
      },
      viewCount: {
        gte: minViews
      },
      publishedAt: {
        gte: maxDate
      }
    };

    // Buscar canais com paginação
    const [channels, totalCount] = await Promise.all([
      db.youTubeChannel.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: offset,
        take: limit,
        include: {
          videos: {
            take: 5,
            orderBy: {
              viewCount: 'desc'
            }
          },
          screenshots: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      }),
      db.youTubeChannel.count({
        where: whereClause
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        channels,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { channelId, title, description, customUrl, thumbnailUrl, country, language } = await request.json();

    if (!channelId || !title) {
      return NextResponse.json({ error: 'Channel ID and title are required' }, { status: 400 });
    }

    const channel = await db.youTubeChannel.create({
      data: {
        channelId,
        title,
        description,
        customUrl,
        thumbnailUrl,
        country: country || 'US',
        language: language || 'en',
        publishedAt: new Date(),
        subscriberCount: 0,
        videoCount: 0,
        viewCount: 0
      }
    });

    return NextResponse.json({ success: true, data: channel });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}