/** @jsxImportSource solid-js */
import { For } from 'solid-js';

export type TabId = 'home' | 'search' | 'discover' | 'bookmarks' | 'profile';

interface Tab {
  id: TabId;
  label: string;
  icon: string; // filled variant
  iconOutline: string; // outlined variant
}

const TABS: Tab[] = [
  { id: 'home',     label: 'Inicio',    icon: 'home',           iconOutline: 'home' },
  { id: 'search',   label: 'Buscar',    icon: 'search',         iconOutline: 'search' },
  { id: 'discover', label: 'Explorar',  icon: 'explore',        iconOutline: 'explore' },
  { id: 'bookmarks',label: 'Guardados', icon: 'bookmark_filled', iconOutline: 'bookmark_border' },
  { id: 'profile',  label: 'Perfil',   icon: 'person_filled',   iconOutline: 'person_outline' },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav(props: BottomNavProps) {
  return (
    <nav
      class="fixed bottom-0 left-0 right-0 z-50 bg-bg-elevated border-t border-border-base"
      style={{ 'padding-bottom': 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navegación principal"
    >
      <div class="flex items-center justify-around h-[var(--bottom-nav-height)] max-w-screen-md mx-auto">
        <For each={TABS}>
          {(tab) => {
            const isActive = () => props.activeTab === tab.id;
            return (
              <button
                onClick={() => props.onTabChange(tab.id)}
                class="flex flex-col items-center justify-center gap-0.5 px-4 py-2 min-w-[56px] transition-transform duration-100 active:scale-90"
                aria-label={tab.label}
                aria-current={isActive() ? 'page' : undefined}
              >
                <span
                  class="material-symbols-rounded text-2xl leading-none transition-colors duration-100"
                  style={{
                    color: isActive() ? 'var(--accent)' : 'var(--text-tertiary)',
                    'font-variation-settings': isActive()
                      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                      : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {isActive() ? tab.icon : tab.iconOutline}
                </span>
                <span
                  class="text-[10px] leading-none font-medium transition-colors duration-100"
                  style={{ color: isActive() ? 'var(--accent)' : 'var(--text-tertiary)' }}
                >
                  {tab.label}
                </span>
              </button>
            );
          }}
        </For>
      </div>
    </nav>
  );
}

export type { TabId };