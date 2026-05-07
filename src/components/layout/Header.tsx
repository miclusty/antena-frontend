/** @jsxImportSource solid-js */
import { createSignal, Show } from 'solid-js';
import SearchBar from '../common/SearchBar';

interface HeaderProps {
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
  onSearch?: (query: string) => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  children?: any;
}

export default function Header(props: HeaderProps) {
  const [searchOpen, setSearchOpen] = createSignal(false);

  return (
    <header class="sticky top-0 z-40 bg-bg-elevated backdrop-blur-md border-b border-border-base">
      <div class="flex items-center justify-between h-14 px-4">
        {/* Left: back or logo */}
        <div class="flex items-center gap-3 min-w-[80px]">
          <Show
            when={props.showBack}
            fallback={
              <div class="flex items-center gap-2">
                {/* Logo mark */}
                <div class="w-8 h-8 rounded-full flex items-center justify-center" style={{ 'background-color': 'var(--accent)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-4v2h2v4zm0-8h2v6h-2V9z"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                    <path d="M12 6v2M12 16v2M6 12h2M16 12h2" stroke="white" stroke-width="1.5"/>
                  </svg>
                </div>
                <span class="font-display font-bold text-lg tracking-tight text-text-primary hidden sm:block">
                  antena<span class="text-accent">.</span>
                </span>
              </div>
            }
          >
            <button
              onClick={props.onBack}
              class="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bg-hover transition-colors"
              aria-label="Volver"
            >
              <span
                class="material-symbols-rounded text-xl text-text-primary"
                style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
              >
                arrow_back
              </span>
            </button>
          </Show>
        </div>

        {/* Center: title (for article view) */}
        <Show when={props.title}>
          <h1 class="font-display font-semibold text-base text-text-primary truncate max-w-[200px] sm:max-w-none">
            {props.title}
          </h1>
        </Show>

        {/* Right: actions */}
        <div class="flex items-center gap-1">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(!searchOpen())}
            class="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bg-hover transition-colors"
            aria-label="Buscar"
          >
            <span
              class="material-symbols-rounded text-xl text-text-secondary"
              style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              search
            </span>
          </button>

          {/* More menu */}
          <button
            class="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bg-hover transition-colors"
            aria-label="Más opciones"
          >
            <span
              class="material-symbols-rounded text-xl text-text-secondary"
              style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
            >
              more_horiz
            </span>
          </button>
        </div>
      </div>

      {/* Inline search bar (toggles open) */}
      <Show when={searchOpen()}>
        <div class="px-4 pb-3 border-b border-border-base">
          <SearchBar onSearch={(q) => {
            props.onSearch?.(q);
            setSearchOpen(false);
          }} />
        </div>
      </Show>

      {/* Category tabs (only on feed, desktop) */}
      <Show when={props.onCategoryChange && !props.showBack}>
        <nav class="hidden md:flex border-t border-border-base">
          <div class="flex items-center px-4 overflow-x-auto">
            {['Todas', 'Política', 'Economía', 'Deportes', 'Sociedad', 'Tecnología', 'Cultura'].map((cat) => (
              <button
                onClick={() => props.onCategoryChange?.(cat)}
                class="relative px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  color: (props.activeCategory || 'Todas') === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                <span>{cat}</span>
                <Show when={(props.activeCategory || 'Todas') === cat}>
                  <span class="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ 'background-color': 'var(--accent)' }} />
                </Show>
              </button>
            ))}
          </div>
        </nav>
      </Show>
    </header>
  );
}