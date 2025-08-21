import puppeteer from 'puppeteer';
import { db } from './db';
import fs from 'fs/promises';
import path from 'path';

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  quality?: number;
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
}

export class ScreenshotService {
  private browser: puppeteer.Browser | null = null;
  private screenshotsDir: string;

  constructor() {
    this.screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  }

  async initializeBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async ensureScreenshotsDirectory() {
    try {
      await fs.access(this.screenshotsDir);
    } catch {
      await fs.mkdir(this.screenshotsDir, { recursive: true });
    }
  }

  async captureChannelScreenshot(
    channelUrl: string, 
    channelId: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    try {
      await this.ensureScreenshotsDirectory();
      const browser = await this.initializeBrowser();
      const page = await browser.newPage();

      // Configurar viewport
      await page.setViewport({
        width: options.width || 1920,
        height: options.height || 1080
      });

      // Navegar para o canal
      await page.goto(channelUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Esperar elementos principais carregarem
      await page.waitForSelector('ytd-channel-renderer, ytd-two-column-browse-results-renderer', { 
        timeout: 10000 
      }).catch(() => {
        console.log('Some channel elements not found, proceeding with screenshot');
      });

      // Rolar um pouco para garantir que tudo carregue
      await page.evaluate(() => {
        window.scrollBy(0, 300);
      });

      // Esperar um pouco mais para animações
      await page.waitForTimeout(2000);

      // Gerar nome de arquivo único
      const timestamp = Date.now();
      const filename = `channel_${channelId}_${timestamp}.${options.type || 'png'}`;
      const filepath = path.join(this.screenshotsDir, filename);

      // Capturar screenshot
      await page.screenshot({
        path: filepath,
        fullPage: options.fullPage || false,
        quality: options.quality || 90,
        type: options.type || 'png'
      });

      await page.close();

      // Gerar thumbnail
      const thumbnailFilename = `channel_${channelId}_${timestamp}_thumb.${options.type || 'png'}`;
      const thumbnailPath = path.join(this.screenshotsDir, thumbnailFilename);
      
      const thumbPage = await browser.newPage();
      await thumbPage.setViewport({ width: 400, height: 225 });
      await thumbPage.goto(channelUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      await thumbPage.waitForTimeout(1000);
      
      await thumbPage.screenshot({
        path: thumbnailPath,
        quality: options.quality || 80,
        type: options.type || 'png'
      });

      await thumbPage.close();

      // Salvar no banco de dados
      const screenshotUrl = `/screenshots/${filename}`;
      const thumbnailUrl = `/screenshots/${thumbnailFilename}`;

      await db.channelScreenshot.create({
        data: {
          channelId,
          screenshotUrl,
          thumbnailUrl,
          description: `Screenshot do canal capturado em ${new Date().toISOString()}`,
          screenshotType: 'channel',
          fileSize: (await fs.stat(filepath)).size,
          width: options.width || 1920,
          height: options.height || 1080
        }
      });

      console.log(`Screenshot captured for channel ${channelId}: ${screenshotUrl}`);
      return screenshotUrl;

    } catch (error) {
      console.error('Error capturing channel screenshot:', error);
      throw error;
    }
  }

  async captureVideoScreenshot(
    videoUrl: string, 
    videoId: string,
    channelId: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    try {
      await this.ensureScreenshotsDirectory();
      const browser = await this.initializeBrowser();
      const page = await browser.newPage();

      await page.setViewport({
        width: options.width || 1280,
        height: options.height || 720
      });

      await page.goto(videoUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Esperar o player de vídeo carregar
      await page.waitForSelector('#movie_player', { timeout: 10000 }).catch(() => {
        console.log('Video player not found, proceeding with screenshot');
      });

      await page.waitForTimeout(2000);

      const timestamp = Date.now();
      const filename = `video_${videoId}_${timestamp}.${options.type || 'png'}`;
      const filepath = path.join(this.screenshotsDir, filename);

      await page.screenshot({
        path: filepath,
        fullPage: false,
        quality: options.quality || 90,
        type: options.type || 'png'
      });

      await page.close();

      const screenshotUrl = `/screenshots/${filename}`;

      await db.channelScreenshot.create({
        data: {
          channelId,
          screenshotUrl,
          description: `Screenshot do vídeo ${videoId} capturado em ${new Date().toISOString()}`,
          screenshotType: 'video',
          fileSize: (await fs.stat(filepath)).size,
          width: options.width || 1280,
          height: options.height || 720
        }
      });

      console.log(`Screenshot captured for video ${videoId}: ${screenshotUrl}`);
      return screenshotUrl;

    } catch (error) {
      console.error('Error capturing video screenshot:', error);
      throw error;
    }
  }

  async captureAnalyticsScreenshot(
    channelUrl: string, 
    channelId: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    try {
      await this.ensureScreenshotsDirectory();
      const browser = await this.initializeBrowser();
      const page = await browser.newPage();

      await page.setViewport({
        width: options.width || 1920,
        height: options.height || 1080
      });

      // Tentar acessar página de analytics (isso pode requerer login)
      const analyticsUrl = channelUrl.replace('/videos', '/about');
      await page.goto(analyticsUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await page.waitForTimeout(3000);

      const timestamp = Date.now();
      const filename = `analytics_${channelId}_${timestamp}.${options.type || 'png'}`;
      const filepath = path.join(this.screenshotsDir, filename);

      await page.screenshot({
        path: filepath,
        fullPage: true,
        quality: options.quality || 90,
        type: options.type || 'png'
      });

      await page.close();

      const screenshotUrl = `/screenshots/${filename}`;

      await db.channelScreenshot.create({
        data: {
          channelId,
          screenshotUrl,
          description: `Screenshot de analytics capturado em ${new Date().toISOString()}`,
          screenshotType: 'analytics',
          fileSize: (await fs.stat(filepath)).size,
          width: options.width || 1920,
          height: options.height || 1080
        }
      });

      console.log(`Analytics screenshot captured for channel ${channelId}: ${screenshotUrl}`);
      return screenshotUrl;

    } catch (error) {
      console.error('Error capturing analytics screenshot:', error);
      throw error;
    }
  }

  async bulkCaptureScreenshots(channelIds: string[]): Promise<string[]> {
    const results: string[] = [];
    
    for (const channelId of channelIds) {
      try {
        const channel = await db.youTubeChannel.findUnique({
          where: { channelId }
        });

        if (!channel) {
          console.log(`Channel ${channelId} not found`);
          continue;
        }

        // Construir URL do canal
        const channelUrl = channel.customUrl 
          ? `https://www.youtube.com/${channel.customUrl}`
          : `https://www.youtube.com/channel/${channel.channelId}`;

        // Capturar screenshot do canal
        const screenshotUrl = await this.captureChannelScreenshot(channelUrl, channelId);
        results.push(screenshotUrl);

        // Pequeno delay entre capturas para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error capturing screenshots for channel ${channelId}:`, error);
      }
    }

    return results;
  }

  async getChannelScreenshots(channelId: string) {
    return await db.channelScreenshot.findMany({
      where: { channelId },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
  }

  async deleteScreenshot(screenshotId: string) {
    const screenshot = await db.channelScreenshot.findUnique({
      where: { id: screenshotId }
    });

    if (!screenshot) {
      throw new Error('Screenshot not found');
    }

    // Deletar arquivo físico
    try {
      const filepath = path.join(process.cwd(), 'public', screenshot.screenshotUrl);
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting screenshot file:', error);
    }

    // Deletar do banco de dados
    await db.channelScreenshot.delete({
      where: { id: screenshotId }
    });

    return true;
  }
}

export const screenshotService = new ScreenshotService();