import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Perform OCR
    const result = await Tesseract.recognize(dataUrl, 'eng', {
      logger: () => {},
    });

    const rawText = result.data.text;

    // Parse metrics from text based on platform
    const metrics = parseMetrics(rawText, platform);

    // Calculate confidence based on how many metrics were found
    const foundMetrics = Object.values(metrics).filter(v => v > 0).length;
    const confidence = (foundMetrics / 8) * 100;

    return NextResponse.json({
      success: true,
      metrics,
      confidence,
      raw_text: rawText,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process image',
      metrics: {},
      confidence: 0,
    });
  }
}

function parseMetrics(text: string, platform: string): Record<string, number> {
  // Initialize metrics
  const metrics = {
    impressions: 0,
    reach: 0,
    views: 0,
    clicks: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
  };

  // Normalize text
  const normalizedText = text.toLowerCase().replace(/,/g, '').replace(/\n/g, ' ');

  // Common patterns for metrics
  const patterns: Record<string, RegExp[]> = {
    impressions: [
      /impressions?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /reach\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /total\s*(?:reach|views)\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
    reach: [
      /accounts?\s*(?:reached)?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /people\s*reached\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
    views: [
      /views?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /plays?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /(?:video\s*)?views?\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
    clicks: [
      /clicks?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /taps?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /profile\s*(?:visits?|clicks?)\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /website\s*clicks?\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
    likes: [
      /likes?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /hearts?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /(?:total\s*)?likes?\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
    comments: [
      /comments?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /replies?\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
    shares: [
      /shares?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /reposts?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /sends?\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
    saves: [
      /saves?\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /saved\s*:?\s*([\d.\dkKmMbB]+)/gi,
      /bookmarks?\s*:?\s*([\d.\dkKmMbB]+)/gi,
    ],
  };

  // Parse each metric
  for (const [metric, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      const match = normalizedText.match(regex);
      if (match) {
        const value = parseAbbreviatedNumber(match[1]);
        if (value > metrics[metric as keyof typeof metrics]) {
          metrics[metric as keyof typeof metrics] = value;
        }
      }
    }
  }

  return metrics;
}

function parseAbbreviatedNumber(value: string): number {
  if (!value) return 0;

  // Remove any non-numeric characters except K, M, B
  const cleaned = value.replace(/[^0-9.KMBkmb]/g, '');

  const multipliers: Record<string, number> = {
    'k': 1000,
    'm': 1000000,
    'b': 1000000000,
  };

  const lastChar = cleaned.slice(-1).toLowerCase();
  const numPart = parseFloat(cleaned);

  if (multipliers[lastChar]) {
    return Math.round(numPart * multipliers[lastChar]);
  }

  return Math.round(numPart);
}
