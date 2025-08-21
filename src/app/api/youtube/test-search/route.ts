import { NextRequest, NextResponse } from 'next/server';
import { YouTubeScraper } from '@/lib/youtube-scraper';

const scraper = new YouTubeScraper();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxAgeDays = parseInt(searchParams.get('maxAgeDays') || '30');
    const minSubscribers = parseInt(searchParams.get('minSubscribers') || '1000');
    const minViews = parseInt(searchParams.get('minViews') || '10000');
    const country = searchParams.get('country') || 'US';
    const keywords = searchParams.get('keywords') || '';
    const maxChannels = parseInt(searchParams.get('maxChannels') || '10');

    console.log('Testing search with parameters:', { maxAgeDays, minSubscribers, minViews, country, keywords, maxChannels });

    const channels = await scraper.searchTrendingChannels(
      maxAgeDays,
      minSubscribers,
      minViews,
      country,
      keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      maxChannels
    );

    return NextResponse.json({
      success: true,
      data: {
        channels,
        searchParams: { maxAgeDays, minSubscribers, minViews, country, keywords, maxChannels },
        count: channels.length
      }
    });
  } catch (error) {
    console.error('Error testing search:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    await scraper.closeBrowser();
  }
}