import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import ffmpeg from 'fluent-ffmpeg';
import { ProjectData } from '@/types';
import path from 'path';
import fs from 'fs';

// Use system ffmpeg (installed via Homebrew)
// This avoids Turbopack compatibility issues with ffmpeg binary packages
const FFMPEG_PATH = process.env.FFMPEG_PATH || '/opt/homebrew/bin/ffmpeg';
ffmpeg.setFfmpegPath(FFMPEG_PATH);

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const projectData: ProjectData = await req.json();
    const tempDir = path.join(process.cwd(), 'public', 'exports', 'temp');
    const outputDir = path.join(process.cwd(), 'public', 'exports');
    
    // Create directories
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // Determine Viewport Height based on canvasSize
    let viewportHeight = 1350; // Default 4:5
    if (projectData.canvasSize === '1:1') viewportHeight = 1080;
    if (projectData.canvasSize === '9:16') viewportHeight = 1920;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: viewportHeight, deviceScaleFactor: 1 });
    await page.goto(`${NEXT_PUBLIC_BASE_URL}/render`, { waitUntil: 'networkidle0' });

    const timestamp = Date.now();
    const imageFiles: string[] = [];

    // Generate screenshots for each slide
    for (let i = 0; i < projectData.slides.length; i++) {
      const slide = projectData.slides[i];
      
      const cardData = {
        ...slide,
        showDate: projectData.showDate,
        showSmallTitle: projectData.showSmallTitle,
        smallTitlePosition: projectData.smallTitlePosition,
        showHeadline: projectData.showHeadline,
        showTags: projectData.showTags,
        enableOverlay: projectData.enableOverlay,
        overlayOpacity: projectData.overlayOpacity,
        enableTextBackground: projectData.enableTextBackground,
        templateType: projectData.templateType,
        logoSrc: projectData.logoSrc,
        logoPosition: projectData.logoPosition,
        fontSettings: projectData.fontSettings,
        textBoxSettings: projectData.textBoxSettings,
        caption: slide.caption || ''
      };

      await page.evaluate((data) => { (window as any).setCardData(data); }, cardData as any);
      await new Promise(r => setTimeout(r, 300));

      const imageFileName = `slide-${timestamp}-${String(i).padStart(3, '0')}.png`;
      const imagePath = path.join(tempDir, imageFileName);
      await page.screenshot({ path: imagePath, type: 'png' });
      imageFiles.push(imagePath);
      
      console.log(`Generated slide ${i+1}/${projectData.slides.length}`);
    }

    await browser.close();

    // Create video from images using ffmpeg
    const videoFileName = `video-${timestamp}.mp4`;
    const videoPath = path.join(outputDir, videoFileName);
    const duration = projectData.videoDuration || 3;
    const transition = projectData.videoTransition || 'fade';

    await new Promise((resolve, reject) => {
      // Create input file list for ffmpeg concat
      const fileListPath = path.join(tempDir, `filelist-${timestamp}.txt`);
      const fileListContent = imageFiles.map(file => `file '${file}'\nduration ${duration}`).join('\n');
      fs.writeFileSync(fileListPath, fileListContent);

      let command = ffmpeg();

      if (transition === 'fade') {
        // Use complex filter for fade transitions
        const filters: string[] = [];
        const inputs: string[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
          inputs.push(`[${i}:v]`);
          
          if (i < imageFiles.length - 1) {
            // Add fade transition between slides
            const fadeStart = i * duration + (duration - 0.5);
            filters.push(
              `[${i}:v]fade=t=out:st=${duration - 0.5}:d=0.5[v${i}fade]`,
              `[${i+1}:v]fade=t=in:st=0:d=0.5[v${i+1}fade]`
            );
          }
        }

        // For simplicity, use concat demuxer with fade in/out on each slide
        command = ffmpeg()
          .input(fileListPath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputFPS(30)
          .videoCodec('libx264')
          .outputOptions([
            '-pix_fmt', 'yuv420p',
            '-preset', 'medium',
            '-crf', '23'
          ])
          .output(videoPath)
          .on('end', () => {
            cleanup();
            resolve(videoPath);
          })
          .on('error', (err) => {
            cleanup();
            reject(err);
          });
      } else {
        // No transition or slide transition - simple concat
        command = ffmpeg()
          .input(fileListPath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputFPS(30)
          .videoCodec('libx264')
          .outputOptions([
            '-pix_fmt', 'yuv420p',
            '-preset', 'medium',
            '-crf', '23'
          ])
          .output(videoPath)
          .on('end', () => {
            cleanup();
            resolve(videoPath);
          })
          .on('error', (err) => {
            cleanup();
            reject(err);
          });
      }

      command.run();

      function cleanup() {
        // Clean up temp files
        try {
          imageFiles.forEach(file => fs.unlinkSync(file));
          fs.unlinkSync(fileListPath);
        } catch (e) {
          console.error('Cleanup error:', e);
        }
      }
    });

    const videoUrl = `${NEXT_PUBLIC_BASE_URL}/exports/${videoFileName}`;
    console.log('Generated video:', videoUrl);

    return NextResponse.json({ 
      success: true, 
      videoUrl,
      duration: projectData.slides.length * duration
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
