/** @jsxImportSource solid-js */
import { createSignal, createResource, createMemo, For, Show } from 'solid-js';
import type { NewsItem, VoiceBreakdown } from '../../lib/types';
import type { ApiLocation } from '../../lib/api';
import { fetchLocations } from '../../lib/api';
import { useAntennas } from '../../lib/antenas';
import BiasBreakdownBar from '../common/BiasBreakdownBar';
import { VOICE_COLORS, VOICE_LABELS } from '../../lib/bias';

interface RightPanelProps {
  news: NewsItem[];
  onNewsClick: (news: NewsItem) => void;
  stats: { total_news: number; active_sources: number; total_locations: number };
}

export default function RightPanel(props: RightPanelProps) {
  const { antennas, addAntenna, removeAntenna, isAntenna } = useAntennas();
  const [showAddDropdown, setShowAddDropdown] = createSignal(false);

  const [locations] = createResource<ApiLocation[]>(async () => {
    try {
      const all = await fetchLocations();
      return all.filter(l => l.type === 'provincia' || (l.type === 'ciudad' && (l.population || 0) > 100000));
    } catch { return []; }
  });

  const biasDistVoices = createMemo<VoiceBreakdown[]>(() => {
    const items = props.news;
    let off = 0, neu = 0, opp = 0;
    for (const n of items) { if (n.bias === 'Oficialista') off++; else if (n.bias === 'Opositor') opp++; else neu++; }
    const total = off + neu + opp || 1;
    return [
      { label: VOICE_LABELS.officialist, color: VOICE_COLORS.officialist, pct: Math.round((off / total) * 100) },
      { label: VOICE_LABELS.neutral, color: VOICE_COLORS.neutral, pct: Math.round((neu / total) * 100) },
      { label: VOICE_LABELS.opposition, color: VOICE_COLORS.opposition, pct: Math.round((opp / total) * 100) },
    ];
  });

  const noiseCount = () => ({
    gacetilla: props.news.filter(n => n.isGacetilla).length,
    clickbait: props.news.filter(n => n.isClickbait).length,
  });

  const topClusters = () => props.news.filter(n => n.sourcesCount > 1).sort((a, b) => b.sourcesCount - a.sourcesCount).slice(0, 3);

  return (
    <aside
      class="hidden xl:block w-[270px] shrink-0 sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto"
      style={{ background: 'var(--bg-base)' }}
      aria-label="Panel derecho"
    >
      {/* Más cubiertas hoy */}
      <Show when={topClusters().length > 0}>
        <div class="rounded-xl border mb-3 overflow-hidden" style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}>
          <div class="h-1" style={{ background: 'linear-gradient(90deg, var(--accent), var(--bias-opposition))' }} />
          <div class="p-3">
            <h3 class="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: 'var(--text-tertiary)' }}>
              <span class="material-symbols-rounded text-base leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}>hub</span>
              Más cubiertas hoy
            </h3>
          </div>
          <ul class="px-3 pb-3">
            <For each={topClusters()}>
              {(item) => (
                <li
                  class="flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer mb-1 transition-colors"
                  style={{ '--twhover': 'var(--bg-hover)' }}
                  onClick={() => props.onNewsClick(item)}
                >
                  <span
                    class="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    {item.sourcesCount}
                  </span>
                  <span class="text-[11px] font-medium line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {item.title.replace('📢 ', '').slice(0, 60)}…
                  </span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      {/* Sesgo hoy */}
      <div class="rounded-xl border mb-3 overflow-hidden" style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}>
        <div class="p-3 pb-2">
          <h3 class="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <span class="material-symbols-rounded text-base leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}>pie_chart</span>
            Sesgo hoy
          </h3>
        </div>
        <div class="px-3 pb-3">
          <BiasBreakdownBar voices={biasDistVoices()} />
        </div>
      </div>

      {/* Ruido filtrado */}
      <div class="rounded-xl border mb-3 overflow-hidden" style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}>
        <div class="p-3 pb-2">
          <h3 class="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <span class="material-symbols-rounded text-base leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--warning)' }}>shield</span>
            Ruido filtrado
          </h3>
        </div>
        <div class="px-3 pb-3">
          <div class="flex items-center justify-between text-[11px] mb-1">
            <span style={{ color: 'var(--text-secondary)' }}>Clickbats destruidos</span>
            <span class="font-semibold" style={{ color: 'var(--warning)' }}>{noiseCount().clickbait}</span>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span style={{ color: 'var(--text-secondary)' }}>Gacetillas marcadas</span>
            <span class="font-semibold" style={{ color: 'var(--accent)' }}>{noiseCount().gacetilla}</span>
          </div>
        </div>
      </div>

      {/* Mis Antenas */}
      <div class="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}>
        <div class="p-3 border-b flex items-center justify-between" style={{ 'border-color': 'var(--border-base)' }}>
          <h3 class="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <span class="material-symbols-rounded text-base leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}>radio</span>
            Mis Antenas
          </h3>
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown())}
            class="size-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-colors"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
          >
            +
          </button>
        </div>

        <div class="p-2">
          <For each={antennas()}>
            {(antenna) => (
              <div class="flex items-center justify-between px-2 py-1.5 rounded mb-1" style={{ background: 'var(--accent-muted)' }}>
                <span class="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  🟢 {antenna.name}
                </span>
                <button
                  onClick={() => removeAntenna(antenna.id)}
                  class="transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <span class="material-symbols-rounded text-[14px] leading-none" style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>remove_circle</span>
                </button>
              </div>
            )}
          </For>

          <Show when={showAddDropdown()}>
            <div class="mt-2 border-t max-h-40 overflow-y-auto" style={{ 'border-color': 'var(--border-base)' }}>
              <For each={(locations() || []).filter(l => !isAntenna(l.id))}>
                {(loc) => (
                  <button
                    onClick={() => { addAntenna({ id: loc.id, name: loc.name, province: loc.province }); setShowAddDropdown(false); }}
                    class="w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span class="text-[11px]">⚪ {loc.name}</span>
                    <span class="material-symbols-rounded text-[14px] leading-none" style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20", color: 'var(--text-tertiary)' }}>add_circle</span>
                  </button>
                )}
              </For>
              <Show when={(locations() || []).filter(l => !isAntenna(l.id)).length === 0}>
                <p class="text-[10px] text-center py-2" style={{ color: 'var(--text-tertiary)' }}>No hay más ubicaciones</p>
              </Show>
            </div>
          </Show>

          <Show when={antennas().length === 0 && !showAddDropdown()}>
            <button
              onClick={() => setShowAddDropdown(true)}
              class="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <span class="material-symbols-rounded text-[14px] leading-none" style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>add_circle</span>
              <span class="text-[11px]">Agregar ubicación</span>
            </button>
          </Show>
        </div>
      </div>
    </aside>
  );
}
