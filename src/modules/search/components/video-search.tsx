"use client";

import { Search } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useVideoSearchSuggestions } from "@/src/modules/search/hooks/use-video-search-suggestions";

export function VideoSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [areSuggestionsDismissed, setAreSuggestionsDismissed] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { suggestionQuery, suggestions } = useVideoSearchSuggestions(query);
  const isSuggestionsOpen =
    isSearchFocused &&
    !areSuggestionsDismissed &&
    suggestionQuery === query.trim() &&
    suggestions.length > 0;

  const navigateToSearch = (value: string) => {
    const trimmedValue = value.trim();
    setIsSearchFocused(false);
    setAreSuggestionsDismissed(true);
    setActiveSuggestion(-1);
    router.push(trimmedValue ? `/?q=${encodeURIComponent(trimmedValue)}` : "/");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToSearch(query);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setAreSuggestionsDismissed(false);
    setActiveSuggestion(-1);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const hasCurrentSuggestions = suggestions.length > 0 && suggestionQuery === query.trim();

    if (event.key === "ArrowDown" && hasCurrentSuggestions) {
      event.preventDefault();
      setAreSuggestionsDismissed(false);
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp" && hasCurrentSuggestions) {
      event.preventDefault();
      setAreSuggestionsDismissed(false);
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Escape") {
      setAreSuggestionsDismissed(true);
      setActiveSuggestion(-1);
      return;
    }

    if (event.key === "Enter" && isSuggestionsOpen && activeSuggestion >= 0) {
      event.preventDefault();
      navigateToSearch(suggestions[activeSuggestion]);
    }
  };

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    setIsSearchFocused(true);
    setAreSuggestionsDismissed(false);
  };

  const handleSearchBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsSearchFocused(false);
      setActiveSuggestion(-1);
    }, 150);
  };

  return (
    <form className="relative hidden w-[calc(100vw-19rem)] max-w-[560px] justify-self-center md:block" onSubmit={handleSearch}>
      <button
        aria-label="Search"
        className="absolute left-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="submit"
      >
        <Search className="h-4 w-4" />
      </button>
      <input
        aria-label="Search videos"
        aria-activedescendant={activeSuggestion >= 0 ? `video-search-suggestion-${activeSuggestion}` : undefined}
        aria-autocomplete="list"
        aria-controls="video-search-suggestions"
        aria-expanded={isSuggestionsOpen}
        className="h-9 w-full rounded-full border border-input bg-background pl-11 pr-4 text-[14px] text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        onBlur={handleSearchBlur}
        onChange={(event) => handleQueryChange(event.currentTarget.value)}
        onFocus={handleSearchFocus}
        onKeyDown={handleSearchKeyDown}
        placeholder="Search videos, channels, and more..."
        role="combobox"
        type="search"
        value={query}
      />
      {isSuggestionsOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur">
          <ul aria-label="Search suggestions" id="video-search-suggestions" role="listbox">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion} role="option" aria-selected={activeSuggestion === index}>
                <button
                  className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] transition ${activeSuggestion === index ? "bg-muted" : "hover:bg-muted"}`}
                  id={`video-search-suggestion-${index}`}
                  onClick={() => navigateToSearch(suggestion)}
                  type="button"
                >
                  <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 truncate">{highlightSuggestion(suggestion, query)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

function highlightSuggestion(suggestion: string, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchStart = suggestion.toLocaleLowerCase().indexOf(normalizedQuery);

  if (!normalizedQuery || matchStart < 0) {
    return suggestion;
  }

  const matchEnd = matchStart + normalizedQuery.length;

  return (
    <>
      {suggestion.slice(0, matchStart)}
      <strong className="font-semibold">{suggestion.slice(matchStart, matchEnd)}</strong>
      {suggestion.slice(matchEnd)}
    </>
  );
}
