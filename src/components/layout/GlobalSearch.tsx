import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, BookOpen, Users, Lightbulb, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGlobalSearch, SearchResult } from "@/hooks/useGlobalSearch";

const typeIcons = {
  note: BookOpen,
  circle: Users,
  thought: Lightbulb,
  "peer-note": FileText,
};

const typeLabels = {
  note: "NoteVerse",
  circle: "StudyCircle",
  thought: "ThinkEdu",
  "peer-note": "PeerNotes",
};

const typeColors = {
  note: "bg-primary/10 text-primary",
  circle: "bg-info/10 text-info",
  thought: "bg-accent/10 text-accent",
  "peer-note": "bg-success/10 text-success",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results from backend
  const { data: results = [], isLoading } = useGlobalSearch(debouncedQuery);

  useEffect(() => {
    if (query.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = results[selectedIndex].href;
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex]);

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto"
      role="search"
      aria-label="Search notes, subjects, or topics"
    >
      {/* Search Container with solid background */}
      <div
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          "bg-card/95 backdrop-blur-md shadow-lg",
          isFocused && "ring-2 ring-primary/30 shadow-xl shadow-primary/10"
        )}
      >
        {/* Search Icon */}
        <Search
          className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200",
            isFocused ? "text-primary" : "text-muted-foreground"
          )}
          aria-hidden="true"
        />

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search notes, circles, or thoughts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // Delay blur to allow click on results
            setTimeout(() => setIsFocused(false), 150);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full pl-14 pr-12 h-14 text-base md:text-lg",
            "bg-transparent border-0 rounded-2xl",
            "placeholder:text-muted-foreground/70",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-200"
          )}
          aria-label="Search"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
        />

        {/* Clear Button / Loader */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && query.length > 1 && (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="w-8 h-8 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0) && (
        <div
          ref={resultsRef}
          id="search-results"
          role="listbox"
          className={cn(
            "absolute top-full left-0 right-0 mt-3 z-50",
            "bg-card/98 backdrop-blur-xl",
            "border border-border/50 rounded-2xl",
            "shadow-2xl shadow-primary/5",
            "overflow-hidden animate-fade-in",
            "max-h-[60vh] overflow-y-auto"
          )}
        >
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Results ({results.length})
            </p>
            {results.map((result, index) => {
              const Icon = typeIcons[result.type];
              const isSelected = index === selectedIndex;

              return (
                <Link
                  key={result.id}
                  to={result.href}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-all duration-150 group",
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/20"
                      : "hover:bg-muted/70"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200",
                    typeColors[result.type],
                    "group-hover:scale-105"
                  )}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium truncate transition-colors",
                      isSelected ? "text-primary" : "group-hover:text-primary"
                    )}>
                      {result.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {result.description}
                    </p>
                  </div>

                  <span className={cn(
                    "text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap",
                    typeColors[result.type]
                  )}>
                    {typeLabels[result.type]}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Keyboard hint */}
          <div className="px-4 py-3 border-t border-border/50 bg-muted/30 hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      )}

      {/* No Results State */}
      {isOpen && query && !isLoading && results.length === 0 && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-3 z-50",
            "bg-card/98 backdrop-blur-xl",
            "border border-border/50 rounded-2xl",
            "shadow-2xl shadow-primary/5",
            "p-8 text-center animate-fade-in"
          )}
        >
          <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            No results found for "<span className="text-foreground">{query}</span>"
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );
}

