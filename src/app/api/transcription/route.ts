import { NextRequest, NextResponse } from 'next/server';
import { transcriptionService } from '@/lib/transcription-service';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const transcription = await transcriptionService.getVideoTranscription(videoId);
    
    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: transcription });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, videoId, videoIds } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'transcribeVideo':
        if (!videoId) {
          return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }
        
        const transcription = await transcriptionService.transcribeVideo(videoId);
        
        return NextResponse.json({ success: true, data: transcription });

      case 'bulkTranscribe':
        if (!videoIds || !Array.isArray(videoIds)) {
          return NextResponse.json({ error: 'Video IDs array is required' }, { status: 400 });
        }
        
        const bulkResults = await transcriptionService.bulkTranscribeVideos(videoIds);
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            transcriptions: bulkResults,
            count: bulkResults.length
          } 
        });

      case 'getChannelTranscriptions':
        if (!videoId) {
          return NextResponse.json({ error: 'Video ID is required to get channel info' }, { status: 400 });
        }
        
        // Buscar vídeo para obter o canal
        const video = await db.youTubeVideo.findUnique({
          where: { videoId },
          include: {
            channel: true
          }
        });
        
        if (!video) {
          return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }
        
        // Buscar todas as transcrições do canal
        const channelVideos = await db.youTubeVideo.findMany({
          where: { channelId: video.channelId },
          select: { videoId: true }
        });
        
        const transcriptions = await Promise.all(
          channelVideos.map(async (v) => {
            const t = await transcriptionService.getVideoTranscription(v.videoId);
            return t ? { ...t, videoId: v.videoId } : null;
          })
        );
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            transcriptions: transcriptions.filter(Boolean),
            channelId: video.channelId
          } 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Transcription service error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}