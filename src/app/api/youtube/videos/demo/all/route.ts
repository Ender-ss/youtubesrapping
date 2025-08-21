import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Buscar todos os canais existentes
    const channels = await db.youTubeChannel.findMany({
      where: { isActive: true },
      take: 20 // Limitar para não sobrecarregar
    });

    if (channels.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No channels found' 
      }, { status: 404 });
    }

    let totalVideosCreated = 0;

    // Para cada canal, criar 5 vídeos de demonstração
    for (const channel of channels) {
      try {
        // Verificar se o canal já tem vídeos
        const existingVideos = await db.youTubeVideo.count({
          where: { channelId: channel.channelId }
        });

        // Pular se já tem vídeos
        if (existingVideos >= 5) {
          console.log(`Channel ${channel.title} already has ${existingVideos} videos, skipping...`);
          continue;
        }

        // Gerar vídeos de demonstração para o canal
        const demoVideos = [
          {
            videoId: `${channel.channelId}_demo_1`,
            title: `${channel.title} - Vídeo Destaque #1`,
            description: `Vídeo mais popular do canal ${channel.title} com conteúdo incrível e engajamento massivo.`,
            thumbnailUrl: `https://picsum.photos/seed/${channel.channelId}_video1/320/180.jpg`,
            publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            duration: Math.floor(Math.random() * 1800) + 300,
            viewCount: Math.floor(Math.random() * 100000) + 10000,
            likeCount: Math.floor(Math.random() * 5000) + 500,
            commentCount: Math.floor(Math.random() * 500) + 50,
            language: channel.language || 'en',
            categoryId: '1'
          },
          {
            videoId: `${channel.channelId}_demo_2`,
            title: `${channel.title} - Conteúdo Exclusivo`,
            description: `Conteúdo exclusivo e especial do canal ${channel.title} que você não pode perder.`,
            thumbnailUrl: `https://picsum.photos/seed/${channel.channelId}_video2/320/180.jpg`,
            publishedAt: new Date(Date.now() - Math.floor(Math.random() * 25) * 24 * 60 * 60 * 1000),
            duration: Math.floor(Math.random() * 1500) + 300,
            viewCount: Math.floor(Math.random() * 80000) + 8000,
            likeCount: Math.floor(Math.random() * 4000) + 400,
            commentCount: Math.floor(Math.random() * 400) + 40,
            language: channel.language || 'en',
            categoryId: '2'
          },
          {
            videoId: `${channel.channelId}_demo_3`,
            title: `${channel.title} - Tutorial Completo`,
            description: `Tutorial completo e detalhado do canal ${channel.title} para ajudar você a aprender.`,
            thumbnailUrl: `https://picsum.photos/seed/${channel.channelId}_video3/320/180.jpg`,
            publishedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
            duration: Math.floor(Math.random() * 2400) + 600,
            viewCount: Math.floor(Math.random() * 60000) + 6000,
            likeCount: Math.floor(Math.random() * 3000) + 300,
            commentCount: Math.floor(Math.random() * 300) + 30,
            language: channel.language || 'en',
            categoryId: '3'
          },
          {
            videoId: `${channel.channelId}_demo_4`,
            title: `${channel.title} - Ao Vivo Especial`,
            description: `Transmissão ao vivo especial do canal ${channel.title} com muita interação.`,
            thumbnailUrl: `https://picsum.photos/seed/${channel.channelId}_video4/320/180.jpg`,
            publishedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
            duration: Math.floor(Math.random() * 7200) + 1800,
            viewCount: Math.floor(Math.random() * 40000) + 4000,
            likeCount: Math.floor(Math.random() * 2000) + 200,
            commentCount: Math.floor(Math.random() * 200) + 20,
            language: channel.language || 'en',
            categoryId: '4'
          },
          {
            videoId: `${channel.channelId}_demo_5`,
            title: `${channel.title} - Resumo Semanal`,
            description: `Resumo semanal com as melhores novidades do canal ${channel.title}.`,
            thumbnailUrl: `https://picsum.photos/seed/${channel.channelId}_video5/320/180.jpg`,
            publishedAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
            duration: Math.floor(Math.random() * 900) + 300,
            viewCount: Math.floor(Math.random() * 30000) + 3000,
            likeCount: Math.floor(Math.random() * 1500) + 150,
            commentCount: Math.floor(Math.random() * 150) + 15,
            language: channel.language || 'en',
            categoryId: '5'
          }
        ];

        // Salvar vídeos no banco de dados
        for (const videoData of demoVideos) {
          try {
            await db.youTubeVideo.upsert({
              where: { videoId: videoData.videoId },
              update: {},
              create: {
                ...videoData,
                channelId: channel.channelId
              }
            });
            totalVideosCreated++;
          } catch (error) {
            console.error('Error creating demo video:', error);
          }
        }

        console.log(`Created 5 demo videos for channel: ${channel.title}`);

      } catch (error) {
        console.error('Error processing channel:', channel.channelId, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Created ${totalVideosCreated} demo videos for ${channels.length} channels`,
        totalVideosCreated,
        channelsProcessed: channels.length
      }
    });
  } catch (error) {
    console.error('Error creating demo videos for all channels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}