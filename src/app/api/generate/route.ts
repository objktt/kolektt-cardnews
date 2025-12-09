import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { ProjectData } from '@/types';
import path from 'path';
import fs from 'fs';

// TODO: Move to env vars
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const projectData: ProjectData = await req.json();
    const generatedUrls: string[] = [];

    // Determine Viewport Height based on canvasSize
    let viewportHeight = 1350; // Default 4:5
    if (projectData.canvasSize === '1:1') viewportHeight = 1080;
    if (projectData.canvasSize === '9:16') viewportHeight = 1920;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set viewport to target size
    await page.setViewport({ width: 1080, height: viewportHeight, deviceScaleFactor: 1 });
    
    await page.goto(`${NEXT_PUBLIC_BASE_URL}/render`, { waitUntil: 'networkidle0' });

    // Loop through slides
    for (let i = 0; i < projectData.slides.length; i++) {
        const slide = projectData.slides[i];
        
        // Merge Global Style + Slide Content
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

        // Inject Data
        await page.evaluate((data) => { (window as any).setCardData(data); }, cardData as any);
        
        // Wait for render (short buffer)
        await new Promise(r => setTimeout(r, 300));

        // Screenshot
        const fileName = `card-${Date.now()}-${i}.png`;
        const publicDir = path.join(process.cwd(), 'public', 'exports');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        
        const filePath = path.join(publicDir, fileName);
        await page.screenshot({ path: filePath, type: 'png' });
        
        const imageUrl = `${NEXT_PUBLIC_BASE_URL}/exports/${fileName}`;
        generatedUrls.push(imageUrl);
        console.log(`Generated Slide ${i+1}:`, imageUrl);

        // Airtable Upload (If credentials exist) - Uploading each slide as a record? 
        // Or maybe just the first one or all in one record?
        // For now, let's keep the logic simple: We won't upload to Airtable in this loop for MVP 
        // unless we want 1 record per slide or 1 record with multiple attachments.
        // Let's do 1 record with Multiple Attachments if possible, or just skip complexity for now.
        // User didn't explicitly ask for Airtable multi-slide support details, just "make multiple sheets".
        // I'll skip Airtable modification for this specific step to avoid breaking it, or maybe just comment it out/adapt.
        // Actually, let's attempt to upload ALL images to ONE Airtable record if possible.
        // Airtable "image" field handles array of objects.
    }

    await browser.close();

    // Airtable Upload Logic (Batch)
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID && generatedUrls.length > 0) {
      const Airtable = (await import('airtable')).default;
      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      const tableName = process.env.AIRTABLE_TABLE_NAME || 'Card News';
      
      const attachments = generatedUrls.map(url => ({ url }));
      
      // Use data from first slide for text fields, or combine?
      // Usually the first slide has the main headline.
      const firstSlide = projectData.slides[0];

      await base(tableName).create([{
        fields: {
          "headline": firstSlide.headline,
          "tags": firstSlide.tags,
          "caption": firstSlide.caption, // Or combine captions?
          "image": attachments as any,
          "template_type": "card_news_v1"
        }
      }]);
    }

    return NextResponse.json({ success: true, imageUrls: generatedUrls });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
