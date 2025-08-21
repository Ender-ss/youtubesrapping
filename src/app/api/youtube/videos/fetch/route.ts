import { NextRequest, NextResponse } from 'next/server';
import { YouTubeScraper } from '@/lib/youtube-scraper';

const scraper = new YouTubeScraper();

export async function POST(request: NextRequest) {
  try {
    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    console.log(`Fetching real videos for channel: ${channelId}`);

    // Buscar vídeos reais do canal
    const videos = await scraper.getChannelVideos(channelId, 5);

    if (videos.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No videos found for this channel' 
      }, { status: 404 });
    }

    // Salvar vídeos no banco de dados
    const savedVideos = [];
    for (const video of videos) {
      try {
        await scraper.saveVideoToDB(video);
        savedVideos.push(video);
        console.log(`Saved video: ${video.title} (${video.viewCount} views)`);
      } catch (error) {
        console.error('Error saving video:', video.videoId, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Fetched and saved ${savedVideos.length} real videos for channel ${channelId}`,
        videos: savedVideos,
        channelId
      }
    });
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return NextResponse.json({ 
      error: `Failed to fetch videos: ${error.message}` 
    }, { status: 500 });
  } finally {
    await scraper.closeBrowser();
  }
}