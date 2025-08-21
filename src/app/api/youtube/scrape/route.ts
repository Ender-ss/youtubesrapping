import { NextRequest, NextResponse } from 'next/server';
import { YouTubeScraper } from '@/lib/youtube-scraper';

const scraper = new YouTubeScraper();

export async function POST(request: NextRequest) {
  try {
    const { action, url, maxAgeDays, minSubscribers, minViews, country, keywords, maxChannels } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'scrapeChannel':
        if (!url) {
          return NextResponse.json({ error: 'Channel URL is required' }, { status: 400 });
        }
        
        const channelInfo = await scraper.getChannelInfo(url);
        if (!channelInfo) {
          return NextResponse.json({ error: 'Failed to scrape channel info' }, { status: 404 });
        }
        
        await scraper.saveChannelToDB(channelInfo);
        
        return NextResponse.json({ success: true, data: channelInfo });

      case 'scrapeVideo':
        if (!url) {
          return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
        }
        
        const videoInfo = await scraper.getVideoInfo(url);
        if (!videoInfo) {
          return NextResponse.json({ error: 'Failed to scrape video info' }, { status: 404 });
        }
        
        await scraper.saveVideoToDB(videoInfo);
        
        return NextResponse.json({ success: true, data: videoInfo });

      case 'searchTrending':
        const trendingChannels = await scraper.searchTrendingChannels(
          maxAgeDays || 30,
          minSubscribers || 1000,
          minViews || 10000,
          country || 'US',
          keywords && typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()).filter(k => k) : [],
          maxChannels || 10
        );
        
        // Salvar canais encontrados no banco de dados
        for (const channel of trendingChannels) {
          await scraper.saveChannelToDB(channel);
        }
        
        return NextResponse.json({ success: true, data: trendingChannels });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('YouTube scraping error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await scraper.closeBrowser();
  }
}