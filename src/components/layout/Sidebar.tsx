/** @jsxImportSource solid-js */
import { For, Show, createMemo } from 'solid-js';
import type { NewsItem } from '../../lib/types';
import { CATEGORIES } from '../../lib/types';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  stats: { total_news: number; active_sources: number; total_locations: number };
  news: NewsItem[];
  categories?: { name: string; icon: string; slug: string }[];
}

export default function Sidebar(props: SidebarProps) {
  const stats = () => props.stats;

  // Trending: news with most sources
  const trending = createMemo(() =>
    [...props.news]
      .filter(n => n.sourcesCount > 1)
      .sort((a, b) => b.sourcesCount - a.sourcesCount)
      .slice(0, 4)
  );

  // Top sources by frequency
  const topSources = createMemo(() => {
    const counts: Record<string, number> = {};
    props.news.forEach(n => {
      const src = n.source;
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  });

  return (
    <aside
      class="hidden lg:flex w-[260px] shrink-0 flex-col gap-3 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto pr-1 pb-4"
      style={{ 'max-height': 'calc(100vh - 3.5rem)' }}
      aria-label="Barra lateral"
    >
      {/* Logo / Brand card */}
      <div
        class="rounded-xl border overflow-hidden"
        style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}
      >
        <div
          class="h-8 flex items-center px-3"
          style={{ background: 'var(--accent)' }}
        >
          <span
            class="material-symbols-rounded text-base text-white leading-none"
            style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
          >
            radio
          </span>
          <span class="ml-2 text-sm font-display font-bold text-white tracking-tight">
            antena<span style={{ color: 'rgba(255,255,255,0.6)' }}>.</span>
          </span>
        </div>
        <div class="p-3">
          <div class="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Fuentes', value: stats().active_sources.toLocaleString() },
              { label: 'Noticias', value: stats().total_news.toLocaleString() },
              { label: 'Ciudades', value: stats().total_locations.toLocaleString() },
            ].map(item => (
              <div>
                <div class="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {item.value}
                </div>
                <div class="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending now */}
      <Show when={trending().length > 0}>
        <div
          class="rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}
        >
          <div class="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ 'border-color': 'var(--border-base)' }}>
            <span
              class="material-symbols-rounded text-sm leading-none"
              style={{ color: 'var(--accent)', 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
            >
              trending_up
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Tendencia
            </span>
          </div>
          <ul class="p-2 flex flex-col gap-0.5">
            <For each={trending()}>
              {(item) => (
                <li>
                  <button
                    onClick={() => props.onCategoryChange(item.category)}
                    class="w-full flex items-start gap-2 px-2 py-2 rounded-lg text-left transition-colors hover:bg-bg-hover"
                  >
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      {item.sourcesCount}
                    </span>
                    <span
                      class="text-xs leading-snug line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title.length > 65 ? item.title.slice(0, 65) + '…' : item.title}
                    </span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      {/* Top sources */}
      <Show when={topSources().length > 0}>
        <div
          class="rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}
        >
          <div class="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ 'border-color': 'var(--border-base)' }}>
            <span
              class="material-symbols-rounded text-sm leading-none"
              style={{ color: 'var(--text-tertiary)', 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              star
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Fuentes top
            </span>
          </div>
          <ul class="p-2 flex flex-col gap-0.5">
            <For each={topSources()}>
              {([name, count]) => (
                <li class="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors">
                  <span class="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                    {name}
                  </span>
                  <span
                    class="text-[10px] font-mono ml-2 shrink-0"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {count}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      {/* Categories */}
      <div
        class="rounded-xl border overflow-hidden"
        style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}
      >
        <div class="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ 'border-color': 'var(--border-base)' }}>
          <span
            class="material-symbols-rounded text-sm leading-none"
            style={{ color: 'var(--text-tertiary)', 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
          >
            category
          </span>
          <span class="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Categorías
          </span>
        </div>
        <ul class="p-2 flex flex-col gap-0.5">
          <For each={(props.categories || CATEGORIES).slice(0, 7)}>
            {(cat) => {
              const isActive = () => props.activeCategory === cat.name;
              return (
                <li>
                  <button
                    onClick={() => props.onCategoryChange(cat.name)}
                    class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={isActive()
                      ? { background: 'var(--accent-muted)', color: 'var(--accent)' }
                      : { color: 'var(--text-secondary)' }
                    }
                  >
                    <span
                      class="material-symbols-rounded text-base leading-none"
                      style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
                    >
                      {cat.icon || 'article'}
                    </span>
                    {cat.name}
                  </button>
                </li>
              );
            }}
          </For>
        </ul>
      </div>

      {/* Footer */}
      <div class="mt-auto pt-2 text-center">
        <p class="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          Antena v2.0 — Datos 2023
        </p>
      </div>
    </aside>
  );
}
