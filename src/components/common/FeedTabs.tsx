/** @jsxImportSource solid-js */
import { For, Show } from 'solid-js';

export interface FeedTab {
  id: string;
  label: string;
}

interface FeedTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs?: FeedTab[];
}

const DEFAULT_TABS: FeedTab[] = [
  { id: 'home', label: 'Para vos' },
  { id: 'following', label: 'Siguiendo' },
  { id: 'explore', label: 'Explorar' },
];

export default function FeedTabs(props: FeedTabsProps) {
  const tabs = () => props.tabs || DEFAULT_TABS;

  return (
    <div class="relative border-b border-border-base">
      {/* Scrollable tabs */}
      <div
        class="flex items-center overflow-x-auto scrollbar-hide px-4"
        style={{ 'scrollbar-width': 'none', '-ms-overflow-style': 'none' }}
      >
        <For each={tabs()}>
          {(tab) => {
            const isActive = () => props.activeTab === tab.id;
            return (
              <button
                onClick={() => props.onTabChange(tab.id)}
                class="relative flex items-center gap-1.5 px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150"
                style={{ color: isActive() ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                <span>{tab.label}</span>
                <Show when={isActive()}>
                  <span
                    class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ 'background-color': 'var(--accent)' }}
                  />
                </Show>
              </button>
            );
          }}
        </For>

        {/* "+" add tab button */}
        <button
          onClick={() => {/* TODO: category picker */}}
          class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-hover transition-colors ml-1"
          aria-label="Añadir pestaña"
        >
          <span
            class="material-symbols-rounded text-lg text-text-tertiary"
            style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
          >
            add
          </span>
        </button>
      </div>
    </div>
  );
}