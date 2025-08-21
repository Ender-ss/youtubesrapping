import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // Verificar se o canal existe
    const channel = await db.youTubeChannel.findUnique({
      where: { channelId }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Gerar vídeos de demonstração para o canal
    const demoVideos = [
      {
        videoId: `${channelId}_demo_1`,
        title: `${channel.title} - Vídeo Destaque #1`,
        description: `Vídeo mais popular do canal ${channel.title} com conteúdo incrível e engajamento massivo.`,
        thumbnailUrl: `https://picsum.photos/seed/${channelId}_video1/320/180.jpg`,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 1800) + 300, // 5-30 minutos
        viewCount: Math.floor(Math.random() * 100000) + 10000, // 10K-110K views
        likeCount: Math.floor(Math.random() * 5000) + 500, // 500-5500 likes
        commentCount: Math.floor(Math.random() * 500) + 50, // 50-550 comments
        language: channel.language || 'en',
        categoryId: '1'
      },
      {
        videoId: `${channelId}_demo_2`,
        title: `${channel.title} - Conteúdo Exclusivo`,
        description: `Conteúdo exclusivo e especial do canal ${channel.title} que você não pode perder.`,
        thumbnailUrl: `https://picsum.photos/seed/${channelId}_video2/320/180.jpg`,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 25) * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 1500) + 300,
        viewCount: Math.floor(Math.random() * 80000) + 8000,
        likeCount: Math.floor(Math.random() * 4000) + 400,
        commentCount: Math.floor(Math.random() * 400) + 40,
        language: channel.language || 'en',
        categoryId: '2'
      },
      {
        videoId: `${channelId}_demo_3`,
        title: `${channel.title} - Tutorial Completo`,
        description: `Tutorial completo e detalhado do canal ${channel.title} para ajudar você a aprender.`,
        thumbnailUrl: `https://picsum.photos/seed/${channelId}_video3/320/180.jpg`,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 2400) + 600,
        viewCount: Math.floor(Math.random() * 60000) + 6000,
        likeCount: Math.floor(Math.random() * 3000) + 300,
        commentCount: Math.floor(Math.random() * 300) + 30,
        language: channel.language || 'en',
        categoryId: '3'
      },
      {
        videoId: `${channelId}_demo_4`,
        title: `${channel.title} - Ao Vivo Especial`,
        description: `Transmissão ao vivo especial do canal ${channel.title} com muita interação.`,
        thumbnailUrl: `https://picsum.photos/seed/${channelId}_video4/320/180.jpg`,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 7200) + 1800,
        viewCount: Math.floor(Math.random() * 40000) + 4000,
        likeCount: Math.floor(Math.random() * 2000) + 200,
        commentCount: Math.floor(Math.random() * 200) + 20,
        language: channel.language || 'en',
        categoryId: '4'
      },
      {
        videoId: `${channelId}_demo_5`,
        title: `${channel.title} - Resumo Semanal`,
        description: `Resumo semanal com as melhores novidades do canal ${channel.title}.`,
        thumbnailUrl: `https://picsum.photos/seed/${channelId}_video5/320/180.jpg`,
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
    const createdVideos = [];
    for (const videoData of demoVideos) {
      try {
        const video = await db.youTubeVideo.upsert({
          where: { videoId: videoData.videoId },
          update: {},
          create: {
            ...videoData,
            channelId: channel.channelId
          }
        });
        createdVideos.push(video);
      } catch (error) {
        console.error('Error creating demo video:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Created ${createdVideos.length} demo videos for channel ${channel.title}`,
        videos: createdVideos
      }
    });
  } catch (error) {
    console.error('Error creating demo videos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}