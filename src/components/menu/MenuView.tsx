/** @jsxImportSource solid-js */
import { For } from 'solid-js';
import { useTheme } from '../../lib/theme';
import { useAntennas } from '../../lib/antenas';

type ViewType = 'feed' | 'article' | 'sintonizar' | 'menu' | 'bookmarks';

interface MenuViewProps {
  onNavigate: (view: ViewType) => void;
  stats: { total_news: number; active_sources: number; total_locations: number };
  savedCount?: number;
}

export default function MenuView(props: MenuViewProps) {
  const { theme, toggleTheme } = useTheme();
  const { antennas } = useAntennas();
  const savedCount = () => props.savedCount || 0;

  const themeLabel = () => theme() === 'dark' ? 'Oscuro' : theme() === 'light' ? 'Claro' : 'Automático';
  const themeIcon = () => theme() === 'dark' ? 'dark_mode' : theme() === 'light' ? 'light_mode' : 'brightness_auto';

  const SectionCard = (p: { children: any; class?: string }) => (
    <div class={`rounded-xl border overflow-hidden ${p.class || ''}`} style={{ background: 'var(--bg-elevated)', 'border-color': 'var(--border-base)' }}>
      {p.children}
    </div>
  );

  const MenuRow = (p: { icon: string; iconFill?: number; label: string; value?: string; onClick?: () => void; children?: any; hover?: boolean }) => (
    <button
      onClick={p.onClick}
      class="w-full flex items-center justify-between p-4 transition-colors"
      style={{ color: 'var(--text-primary)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div class="flex items-center gap-3">
        <span
          class="material-symbols-rounded text-xl leading-none"
          style={{ 'font-variation-settings': `'FILL' ${p.iconFill || 0}, 'wght' 300, 'GRAD' 0, 'opsz' 20`, color: 'var(--accent)' }}
        >
          {p.icon}
        </span>
        <span class="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
      </div>
      <div class="flex items-center gap-2">
        {p.value && <span class="text-xs" style={{ color: 'var(--text-tertiary)' }}>{p.value}</span>}
        {p.children || (
          <span
            class="material-symbols-rounded text-lg leading-none"
            style={{ color: 'var(--text-tertiary)', 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}
          >
            chevron_right
          </span>
        )}
      </div>
    </button>
  );

  return (
    <div class="min-h-screen pb-24" style={{ background: 'var(--bg-base)' }}>
      <header class="pt-12 pb-4 px-6">
        <h1
          class="text-2xl font-bold tracking-tight"
          style={{ 'font-family': 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Menú
        </h1>
      </header>

      <div class="px-6 space-y-4">
        {/* Profile Card */}
        <SectionCard>
          <div class="flex items-center gap-3 p-4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--bias-opposition))' }}
            >
              <span
                class="material-symbols-rounded text-white text-xl leading-none"
                style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
              >
                radio
              </span>
            </div>
            <div>
              <h2 class="text-base font-bold" style={{ 'font-family': 'var(--font-display)', color: 'var(--text-primary)' }}>
                antena<span style={{ color: 'var(--accent)' }}>.</span>
              </h2>
              <p class="text-xs" style={{ color: 'var(--text-tertiary)' }}>v2.0 — Sintonizá tu realidad</p>
            </div>
          </div>
        </SectionCard>

        {/* Guardados */}
        <SectionCard>
          <MenuRow
            icon="bookmark"
            iconFill={0}
            label="Guardados"
            value={String(savedCount())}
            onClick={() => props.onNavigate('bookmarks')}
          />
        </SectionCard>

        {/* Mis Antenas */}
        <SectionCard>
          <div class="p-4 border-b" style={{ 'border-color': 'var(--border-base)' }}>
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-xl leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}>radio</span>
              <span class="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Mis Antenas</span>
            </div>
          </div>
          <div class="p-2">
            <For each={antennas()}>
              {(loc) => (
                <div class="flex items-center justify-between px-3 py-2 rounded" style={{ color: 'var(--text-primary)' }}>
                  <span class="text-sm">🟢 {loc.name}{loc.province ? `, ${loc.province}` : ''}</span>
                  <span class="material-symbols-rounded text-base leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}>check_circle</span>
                </div>
              )}
            </For>
            <button
              class="w-full flex items-center gap-3 px-3 py-2 rounded transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span class="material-symbols-rounded text-lg leading-none" style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>add_circle</span>
              <span class="text-sm">Agregar ubicación</span>
            </button>
          </div>
        </SectionCard>

        {/* Modo Mate */}
        <SectionCard>
          <div class="p-4 border-b" style={{ 'border-color': 'var(--border-base)' }}>
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-xl leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}>record_voice_over</span>
              <span class="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Modo Mate</span>
            </div>
          </div>
          <div class="p-4">
            <p class="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Antena te lee las noticias mientras tomás mate.</p>
            <button
              onClick={() => props.onNavigate('sintonizar')}
              class="w-full py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
            >
              Configurar Modo Mate
            </button>
          </div>
        </SectionCard>

        {/* Tema */}
        <SectionCard>
          <MenuRow icon={themeIcon()} iconFill={0} label="Tema" value={themeLabel()} onClick={toggleTheme} />
        </SectionCard>

        {/* Stats */}
        <SectionCard>
          <div class="p-4 border-b" style={{ 'border-color': 'var(--border-base)' }}>
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-xl leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}>analytics</span>
              <span class="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Estadísticas</span>
            </div>
          </div>
          <div class="p-4 space-y-2">
            {[
              ['Fuentes activas', props.stats.active_sources],
              ['Noticias', props.stats.total_news],
              ['Predios', props.stats.total_locations],
            ].map(([label, val]) => (
              <div class="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                <span class="font-semibold" style={{ color: 'var(--text-primary)' }}>{(val as number).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* About */}
        <SectionCard>
          <div class="p-4">
            <div class="flex items-center gap-3">
              <span class="material-symbols-rounded text-lg leading-none" style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20", color: 'var(--text-tertiary)' }}>info</span>
              <span class="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Acerca de Antena</span>
            </div>
            <p class="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
              Antena es un agregador de noticias hiperlocales de Argentina.
              Conectate con las fuentes de tu zona.
            </p>
            <div class="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span class="material-symbols-rounded text-base leading-none" style={{ 'font-variation-settings': "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>radio</span>
              <span>Versión 2.0</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
