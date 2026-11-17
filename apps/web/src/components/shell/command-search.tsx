"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function CommandSearch({ items }: { items: NavItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        inputRef.current?.blur();
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q),
    );
  }, [items, query]);

  const showResults = open && results.length > 0;

  function go(href: string) {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && results[0]) {
      event.preventDefault();
      go(results[0].href);
    }
  }

  return (
    <div className="relative min-w-0 flex-1 md:max-w-md lg:max-w-lg lg:flex-none xl:max-w-xl">
      <div
        className={cn(
          "command-bar-search group flex h-10 items-center gap-3 rounded-full border border-subtle bg-surface/45 px-4 transition-[border-color,box-shadow,background]",
          open && "border-accent-cyan/25 bg-surface/70",
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-text-secondary transition-colors group-focus-within:text-accent-cyan" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search modules…"
          aria-label="Search modules and pages"
          aria-expanded={showResults}
          aria-controls="command-search-results"
          autoComplete="off"
          className="h-7 flex-1 border-0 bg-transparent px-0 text-sm text-text-primary shadow-none placeholder:text-text-secondary focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
        />
        <kbd className="hidden shrink-0 rounded-md border border-subtle bg-surface-hover/80 px-2 py-0.5 font-mono text-[10px] text-text-secondary lg:inline">
          ⌘K
        </kbd>
      </div>

      {showResults ? (
        <ul
          id="command-search-results"
          role="listbox"
          className="absolute top-[calc(100%+6px)] z-50 max-h-64 w-full overflow-y-auto rounded-xl border border-subtle bg-surface p-1 shadow-lg shadow-black/25"
        >
          {results.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href} role="option">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(item.href)}
                >
                  <Icon className="h-4 w-4 shrink-0 text-text-secondary" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="font-mono text-[10px] text-text-secondary">{item.href}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}