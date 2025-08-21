import { NextRequest, NextResponse } from 'next/server';
import { YouTubeScraper } from '@/lib/youtube-scraper';
import { db } from '@/lib/db';

const scraper = new YouTubeScraper();

export async function POST(request: NextRequest) {
  try {
    // Buscar todos os canais existentes
    const channels = await db.youTubeChannel.findMany({
      where: { isActive: true },
      take: 10 // Limitar para não sobrecarregar
    });

    if (channels.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No channels found' 
      }, { status: 404 });
    }

    console.log(`Fetching real videos for ${channels.length} channels`);

    let totalVideosFetched = 0;
    let channelsProcessed = 0;
    const results = [];

    // Para cada canal, buscar vídeos reais
    for (const channel of channels) {
      try {
        console.log(`Processing channel: ${channel.title} (${channel.channelId})`);
        
        // Buscar vídeos reais do canal
        const videos = await scraper.getChannelVideos(channel.channelId, 5);

        if (videos.length > 0) {
          // Salvar vídeos no banco de dados
          const savedVideos = [];
          for (const video of videos) {
            try {
              await scraper.saveVideoToDB(video);
              savedVideos.push(video);
              totalVideosFetched++;
            } catch (error) {
              console.error('Error saving video:', video.videoId, error);
            }
          }

          channelsProcessed++;
          results.push({
            channelId: channel.channelId,
            channelTitle: channel.title,
            videosFetched: savedVideos.length,
            videos: savedVideos
          });

          console.log(`Fetched ${savedVideos.length} real videos for channel: ${channel.title}`);
        } else {
          console.log(`No videos found for channel: ${channel.title}`);
        }

        // Pequena pausa para não sobrecarregar as APIs
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Error processing channel:', channel.channelId, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Fetched ${totalVideosFetched} real videos from ${channelsProcessed} channels`,
        totalVideosFetched,
        channelsProcessed,
        totalChannels: channels.length,
        results
      }
    });
  } catch (error) {
    console.error('Error fetching videos for all channels:', error);
    return NextResponse.json({ 
      error: `Failed to fetch videos: ${error.message}` 
    }, { status: 500 });
  } finally {
    await scraper.closeBrowser();
  }
}