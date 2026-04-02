import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 600;
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  return h * 3600 + m * 60 + s;
}

async function fetchYouTubeDetails(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items || data.items.length === 0) return null;
  const item = data.items[0];
  return {
    title: item.snippet.title as string,
    description: item.snippet.description as string,
    duration: parseIsoDuration(item.contentDetails.duration),
    channelTitle: item.snippet.channelTitle as string,
  };
}

async function analyzeWithClaude(
  videoTitle: string,
  description: string,
  duration: number,
  clipLength: number,
  clipCount: number,
  style: string
): Promise<Clip[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are an expert video content analyst specializing in creating viral short-form clips for TikTok, Instagram Reels, and YouTube Shorts.

Video Info:
- Title: ${videoTitle}
- Duration: ${duration} seconds (${Math.floor(duration / 60)}m ${duration % 60}s)
- Description/Chapters: ${description.slice(0, 2000)}

Task: Identify the ${clipCount} best ${clipLength}-second clips for "${style}" style.

Style definitions:
- highlights: Most engaging/emotional/surprising moments
- intro: Strong hooks that grab attention in first 3 seconds  
- outro: Calls-to-action or memorable closing moments

For each clip, provide:
1. Start time (in seconds from video start)
2. A catchy clip title (max 8 words)
3. Virality score (0.0-1.0)

Respond ONLY with valid JSON array, no markdown:
[
  {"startTime": 45, "title": "Mind-Blowing Revelation Changes Everything", "score": 0.97},
  ...
]

Rules:
- Spread clips throughout the video
- No overlap between clips (each clip is ${clipLength}s long)
- Don't exceed video duration (${duration}s)
- Higher scores for more engaging moments`;

  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  
  try {
    const parsed = JSON.parse(text);
    const videoId = ""; // will be set by caller
    return parsed.slice(0, clipCount).map((item: { startTime: number; title: string; score: number }, i: number) => ({
      id: `clip-${i + 1}`,
      startTime: Math.max(0, Math.min(item.startTime, duration - clipLength)),
      endTime: Math.max(0, Math.min(item.startTime, duration - clipLength)) + clipLength,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      title: item.title,
      score: item.score,
    }));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { url, clipLength, clipCount, style } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Fetch real YouTube video info
    const videoDetails = await fetchYouTubeDetails(videoId);
    if (!videoDetails) {
      return NextResponse.json({ error: "Could not fetch video details" }, { status: 404 });
    }

    const { title, description, duration } = videoDetails;

    // Use Claude AI to analyze and find best clips
    const clips = await analyzeWithClaude(
      title,
      description,
      duration,
      clipLength,
      clipCount,
      style
    );

    // Inject real thumbnails
    const clipsWithThumbnails = clips.map((clip) => ({
      ...clip,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    }));

    return NextResponse.json({
      videoTitle: title,
      videoDuration: duration,
      clips: clipsWithThumbnails,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
