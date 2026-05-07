/** @jsxImportSource solid-js */
import { For } from 'solid-js';
import type { NewsItem } from '../../lib/types';
import { useHaptic } from '../../lib/haptic';

interface ClusterViewProps {
  clusterId: string;
  articles: NewsItem[];
  onArticleSelect: (article: NewsItem) => void;
}

export default function ClusterView(props: ClusterViewProps) {
  const haptic = useHaptic();
  return (
    <section
      class="rounded-xl border p-4 mb-4"
      style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}
    >
      <h2
        class="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span
          class="material-symbols-rounded text-base leading-none"
          style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}
        >
          hub
        </span>
        Otras fuentes sobre esta noticia
      </h2>
      <p class="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
        {props.articles.length} fuentes cubren esta historia
      </p>

      <div class="flex flex-col gap-1.5">
        <For each={props.articles.slice(1, 8)}>
          {(article) => (
            <button
              onClick={() => { haptic.vibrate('tap'); props.onArticleSelect(article); }}
              class="flex items-start gap-3 p-2.5 rounded-lg transition-colors text-left border"
              style={{
                background: 'transparent',
                'border-color': 'transparent',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'var(--bg-hover)';
                el.style.borderColor = 'var(--border-base)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'transparent';
                el.style.borderColor = 'transparent';
              }}
            >
              <div
                class="w-1 h-full min-h-[28px] rounded-full shrink-0 mt-0.5"
                style={{ 'background-color': article.biasColor }}
              />
              <div class="flex-1 min-w-0">
                <h3
                  class="text-[13px] font-semibold line-clamp-2 leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {article.title.replace('📢 ', '')}
                </h3>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{article.source}</span>
                  <span class="w-0.5 h-0.5 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
                  <span class="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{article.time}</span>
                  <span class="w-0.5 h-0.5 rounded-full" style={{ background: 'var(--text-tertiary)' }} />
                  <span
                    class="text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded"
                    style={{
                      'background-color': article.biasColor + '18',
                      color: article.biasColor,
                    }}
                  >
                    {article.bias}
                  </span>
                </div>
              </div>
            </button>
          )}
        </For>
      </div>

      {props.articles.length > 8 && (
        <div class="mt-3 pt-3 text-center" style={{ 'border-top': '1px solid var(--border-base)' }}>
          <span class="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Y {props.articles.length - 8} fuentes más...
          </span>
        </div>
      )}
    </section>
  );
}
