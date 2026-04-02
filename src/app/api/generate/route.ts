import { NextRequest, NextResponse } from "next/server";

interface GenerateRequest {
  url: string;
  clipLength: number;
  clipCount: number;
  style: string;
}

interface Clip {
  id: string;
  startTime: number;
  endTime: number;
  thumbnailUrl: string;
  title: string;
  score: number;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const CLIP_TITLES: Record<string, string[]> = {
  highlights: [
    "Most Engaging Moment",
    "Peak Emotional Point",
    "Key Insight",
    "Viral-Worthy Segment",
    "High Energy Moment",
  ],
  intro: [
    "Perfect Hook Opening",
    "Attention-Grabbing Intro",
    "Strong Opening Statement",
    "First Impression Clip",
    "Opening Power Move",
  ],
  outro: [
    "Powerful Closing Statement",
    "Call-to-Action Moment",
    "Memorable Ending",
    "Final Key Takeaway",
    "Closing Impact Clip",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { url, clipLength, clipCount, style } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const titles = CLIP_TITLES[style] || CLIP_TITLES.highlights;
    const videoDuration = 600; // Assume 10 min video

    const clips: Clip[] = Array.from({ length: clipCount }, (_, i) => {
      const maxStart = videoDuration - clipLength;
      const startTime = Math.floor(
        (maxStart / (clipCount + 1)) * (i + 1) + Math.random() * 20 - 10
      );
      const clampedStart = Math.max(0, Math.min(startTime, maxStart));

      return {
        id: `clip-${i + 1}`,
        startTime: clampedStart,
        endTime: clampedStart + clipLength,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        title: `${titles[i % titles.length]} #${i + 1}`,
        score: parseFloat((0.98 - i * 0.05 + Math.random() * 0.03).toFixed(2)),
      };
    });

    return NextResponse.json(clips);
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
