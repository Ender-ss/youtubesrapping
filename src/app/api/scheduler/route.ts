import { NextRequest, NextResponse } from 'next/server';
import { ReportScheduler } from '@/lib/scheduler';

const scheduler = new ReportScheduler();

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'start':
        scheduler.start();
        return NextResponse.json({ success: true, message: 'Scheduler started successfully' });

      case 'stop':
        scheduler.stop();
        return NextResponse.json({ success: true, message: 'Scheduler stopped successfully' });

      case 'manualSearch':
        await scheduler.manualSearchTrendingChannels();
        return NextResponse.json({ success: true, message: 'Manual search completed' });

      case 'manualReport':
        await scheduler.manualGenerateDailyReport();
        return NextResponse.json({ success: true, message: 'Manual report generated' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}