"use client";

import { useState } from "react";
import UrlForm from "@/components/UrlForm";
import ClipCard from "@/components/ClipCard";
import LoadingState from "@/components/LoadingState";

interface Clip {
  id: string;
  startTime: number;
  endTime: number;
  thumbnailUrl: string;
  title: string;
  score: number;
}

export default function Home() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipCount, setClipCount] = useState(3);

  const handleSubmit = async (data: {
    url: string;
    clipLength: number;
    clipCount: number;
    style: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setClips([]);
    setClipCount(data.clipCount);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      const result: Clip[] = await res.json();
      setClips(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="white"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="font-bold text-lg">
              YT Short Clipper
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="hidden sm:inline">AI-Powered</span>
            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
              Beta
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-sm text-zinc-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Powered by AI analysis
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Turn any YouTube video into{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              viral short clips
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Paste a YouTube link and let AI find the most engaging moments.
            Export ready-to-post clips for TikTok, Instagram Reels, and YouTube
            Shorts.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16 px-4">
        <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
      </section>

      {/* Error */}
      {error && (
        <section className="pb-8 px-4">
          <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        </section>
      )}

      {/* Loading */}
      {isLoading && (
        <section className="pb-16 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Analyzing video...</h2>
              <p className="text-zinc-400">
                Finding the most engaging moments for your short clips
              </p>
            </div>
            <LoadingState count={clipCount} />
          </div>
        </section>
      )}

      {/* Results */}
      {clips.length > 0 && !isLoading && (
        <section className="pb-16 px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {clips.length} clips ready
              </h2>
              <p className="text-zinc-400">
                Here are the best moments we found. Download or customize them.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clips.map((clip, i) => (
                <ClipCard key={clip.id} clip={clip} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/50 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>YT Short Clipper — AI-powered video clipping</span>
          <div className="flex gap-6">
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">
              About
            </span>
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">
              Contact
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
