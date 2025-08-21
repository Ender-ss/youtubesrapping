import { NextRequest, NextResponse } from 'next/server';
import { screenshotService } from '@/lib/screenshot-service';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const screenshots = await screenshotService.getChannelScreenshots(channelId);
    
    return NextResponse.json({ success: true, data: screenshots });
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, channelId, videoId, url, options } = await request.json();

    if (!action || !channelId) {
      return NextResponse.json({ error: 'Action and channel ID are required' }, { status: 400 });
    }

    switch (action) {
      case 'captureChannel':
        if (!url) {
          return NextResponse.json({ error: 'Channel URL is required' }, { status: 400 });
        }
        
        const channelScreenshot = await screenshotService.captureChannelScreenshot(
          url, 
          channelId, 
          options || {}
        );
        
        return NextResponse.json({ success: true, data: { screenshotUrl: channelScreenshot } });

      case 'captureVideo':
        if (!videoId || !url) {
          return NextResponse.json({ error: 'Video ID and URL are required' }, { status: 400 });
        }
        
        const videoScreenshot = await screenshotService.captureVideoScreenshot(
          url, 
          videoId, 
          channelId,
          options || {}
        );
        
        return NextResponse.json({ success: true, data: { screenshotUrl: videoScreenshot } });

      case 'captureAnalytics':
        if (!url) {
          return NextResponse.json({ error: 'Channel URL is required' }, { status: 400 });
        }
        
        const analyticsScreenshot = await screenshotService.captureAnalyticsScreenshot(
          url, 
          channelId, 
          options || {}
        );
        
        return NextResponse.json({ success: true, data: { screenshotUrl: analyticsScreenshot } });

      case 'bulkCapture':
        const { channelIds } = await request.json();
        if (!channelIds || !Array.isArray(channelIds)) {
          return NextResponse.json({ error: 'Channel IDs array is required' }, { status: 400 });
        }
        
        const bulkResults = await screenshotService.bulkCaptureScreenshots(channelIds);
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            screenshots: bulkResults,
            count: bulkResults.length
          } 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Screenshot service error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const screenshotId = searchParams.get('screenshotId');

    if (!screenshotId) {
      return NextResponse.json({ error: 'Screenshot ID is required' }, { status: 400 });
    }

    await screenshotService.deleteScreenshot(screenshotId);
    
    return NextResponse.json({ success: true, message: 'Screenshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}