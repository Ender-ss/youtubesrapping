import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Limpar todos os canais e vídeos do banco de dados
    const result = await db.youTubeChannel.deleteMany({
      where: {
        // Opcional: limpar apenas canais de demonstração
        // title: {
        //   contains: 'Channel'
        // }
      }
    });

    // Limpar também os vídeos (serão deletados em cascata pelo Prisma)
    const videoCount = await db.youTubeVideo.count();

    console.log(`Cleared ${result.count} channels and ${videoCount} videos from database`);

    return NextResponse.json({
      success: true,
      data: {
        message: `Limpos ${result.count} canais e ${videoCount} vídeos do banco de dados`,
        channelsCleared: result.count,
        videosCleared: videoCount
      }
    });
  } catch (error) {
    console.error('Error clearing channels:', error);
    return NextResponse.json({ 
      error: `Failed to clear channels: ${error.message}` 
    }, { status: 500 });
  }
}