"use client";

import { useState } from "react";

interface UrlFormProps {
  onSubmit: (data: {
    url: string;
    clipLength: number;
    clipCount: number;
    style: string;
  }) => void;
  isLoading: boolean;
}

const CLIP_LENGTHS = [
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
];

const STYLES = [
  { value: "highlights", label: "Highlights", icon: "✦" },
  { value: "intro", label: "Intro", icon: "▶" },
  { value: "outro", label: "Outro", icon: "◼" },
];

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [clipLength, setClipLength] = useState(30);
  const [clipCount, setClipCount] = useState(3);
  const [style, setStyle] = useState("highlights");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit({ url: url.trim(), clipLength, clipCount, style });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {/* URL Input */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-50 group-focus-within:opacity-100 blur transition-opacity" />
        <div className="relative flex items-center bg-zinc-900 rounded-xl">
          <div className="pl-4 text-zinc-500">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube URL..."
            className="w-full px-4 py-4 bg-transparent text-white placeholder-zinc-500 outline-none text-lg"
            required
          />
        </div>
      </div>

      {/* Options Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Clip Length */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">
            Clip Length
          </label>
          <div className="flex gap-2">
            {CLIP_LENGTHS.map((len) => (
              <button
                key={len.value}
                type="button"
                onClick={() => setClipLength(len.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  clipLength === len.value
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                    : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-300"
                }`}
              >
                {len.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clip Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">
            Clips: {clipCount}
          </label>
          <div className="flex items-center gap-3 h-[38px]">
            <input
              type="range"
              min={1}
              max={5}
              value={clipCount}
              onChange={(e) => setClipCount(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Style</label>
          <div className="flex gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                  style === s.value
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                    : "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-300"
                }`}
              >
                <span className="mr-1">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold text-lg rounded-xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Analyzing Video...
          </span>
        ) : (
          "Generate Clips"
        )}
      </button>
    </form>
  );
}
