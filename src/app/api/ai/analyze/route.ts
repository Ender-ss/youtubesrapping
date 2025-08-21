import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { action, channelId, videoId, channels } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'analyzeChannelTrends':
        if (!channels || !Array.isArray(channels)) {
          return NextResponse.json({ error: 'Channels array is required' }, { status: 400 });
        }
        
        const trendsAnalysis = await aiService.analyzeChannelTrends(channels);
        return NextResponse.json({ success: true, data: trendsAnalysis });

      case 'analyzeVideo':
        if (!videoId) {
          return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }
        
        const video = await db.youTubeVideo.findUnique({
          where: { videoId },
          include: {
            channel: true
          }
        });
        
        if (!video) {
          return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }
        
        const videoAnalysis = await aiService.analyzeVideoContent(video);
        return NextResponse.json({ success: true, data: videoAnalysis });

      case 'generateChannelReport':
        if (!channelId) {
          return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }
        
        const channel = await db.youTubeChannel.findUnique({
          where: { channelId },
          include: {
            videos: {
              take: 10,
              orderBy: {
                viewCount: 'desc'
              }
            }
          }
        });
        
        if (!channel) {
          return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }
        
        const channelReport = await aiService.generateChannelReport(channel);
        return NextResponse.json({ success: true, data: channelReport });

      case 'searchTrends':
        const { query } = await request.json();
        if (!query) {
          return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }
        
        const searchResults = await aiService.searchWebForTrends(query);
        return NextResponse.json({ success: true, data: searchResults });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}