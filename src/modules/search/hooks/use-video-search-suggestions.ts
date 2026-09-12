"use client";

import { useEffect, useState } from "react";

const MAX_SUGGESTIONS = 8;

type SuggestionsResponse = {
  suggestions?: unknown;
};

type VideoSearchSuggestions = {
  query: string;
  suggestions: string[];
};

export function useVideoSearchSuggestions(query: string) {
  const [result, setResult] = useState<VideoSearchSuggestions>({ query: "", suggestions: [] });

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/videos/suggestions?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load search suggestions.");
        }

        const data = (await response.json()) as SuggestionsResponse;
        const nextSuggestions = Array.isArray(data.suggestions)
          ? data.suggestions.filter((suggestion): suggestion is string => typeof suggestion === "string").slice(0, MAX_SUGGESTIONS)
          : [];

        setResult({ query: trimmedQuery, suggestions: nextSuggestions });
      } catch {
        if (!controller.signal.aborted) {
          setResult({ query: trimmedQuery, suggestions: [] });
        }
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return {
    suggestionQuery: result.query,
    suggestions: result.suggestions,
  };
}
