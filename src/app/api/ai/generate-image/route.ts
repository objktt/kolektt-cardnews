import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Create Generation Task
async function createTask(apiKey: string, prompt: string) {
    const response = await fetch(`${API_BASE_URL}/createTask`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "nano-banana-pro",
            input: {
                prompt: prompt,
                aspect_ratio: "3:4", 
                resolution: "1K",
                output_format: "png"
            }
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Task Creation Failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    if (data.code !== 200) {
        throw new Error(`Task Creation Error: ${data.msg}`);
    }

    return data.data.taskId;
}

// 2. Poll for Status
async function waitForTaskResult(apiKey: string, taskId: string) {
    const maxAttempts = 60; // 60 seconds max
    const intervalMs = 1000;

    for (let i = 0; i < maxAttempts; i++) {
        await delay(intervalMs);

        const response = await fetch(`${API_BASE_URL}/recordInfo?taskId=${taskId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            console.warn(`Polling failed (${response.status}), retrying...`);
            continue;
        }

        const data = await response.json();
        const state = data.data?.state;

        if (state === 'success') {
            try {
                const result = JSON.parse(data.data.resultJson);
                const imageUrl = result.resultUrls?.[0];
                if (!imageUrl) throw new Error("No image URL in result");
                return imageUrl;
            } catch (e) {
                throw new Error("Failed to parse success result");
            }
        } else if (state === 'fail') {
            throw new Error(`Generation Failed: ${data.data.failMsg || 'Unknown error'}`);
        }
        // If 'waiting' or other, continue loop
    }
    
    throw new Error("Generation timed out");
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    // Support both env vars just in case, preferring KIE specifically
    const apiKey = process.env.KIE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API Key not configured' }, { status: 500 });
    }

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    console.log("Starting Nano Banana Pro generation...");
    
    // Step 1: Create Task
    const taskId = await createTask(apiKey, prompt);
    console.log(`Task created: ${taskId}`);

    // Step 2: Poll for Result
    const imageUrl = await waitForTaskResult(apiKey, taskId);
    console.log(`Task success: ${imageUrl}`);
    
    return NextResponse.json({ success: true, imageSrc: imageUrl });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
