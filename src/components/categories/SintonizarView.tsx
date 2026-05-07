/** @jsxImportSource solid-js */
import { createSignal } from 'solid-js';
import { CATEGORIES } from '../../lib/types';
import { toast } from '../Toast';

interface SintonizarViewProps {
  onCategorySelect: (cat: string) => void;
}

export default function SintonizarView(props: SintonizarViewProps) {
  const [activeCategory, setActiveCategory] = createSignal('Todas');

  const handleCategorySelect = (catName: string) => {
    setActiveCategory(catName);
    props.onCategorySelect(catName);
  };

  const serviceItems = [
    { icon: 'traffic', label: 'Cortes de calle' },
    { icon: 'local_pharmacy', label: 'Farmacias de turno' },
    { icon: 'directions_bus', label: 'Transporte' },
    { icon: 'warning', label: 'Alertas' },
  ];

  return (
    <div class="min-h-screen pb-24 max-w-lg mx-auto" style={{ background: 'var(--bg-base)' }}>
      <header class="pt-12 pb-4 px-6 text-center">
        <h1
          class="text-2xl font-bold tracking-tight"
          style={{ 'font-family': 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Categorías
        </h1>
        <p class="text-sm font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Sintonizá tu entorno
        </p>
      </header>

      {/* Category Grid */}
      <section class="px-6 py-6">
        <div class="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const active = activeCategory() === cat.name;
            return (
              <button
                onClick={() => handleCategorySelect(cat.name)}
                class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-colors"
                style={{
                  background: active ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                  'border-color': active ? 'var(--accent)' : 'var(--border-base)',
                  color: 'var(--text-primary)',
                }}
              >
                <span
                  class="material-symbols-rounded text-[28px] leading-none"
                  style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}
                >
                  {cat.icon}
                </span>
                <span class="text-xs font-semibold leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Community Services */}
      <section class="px-6 mt-6">
        <h2 class="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Servicio Comunidad
        </h2>
        <div class="flex flex-wrap gap-2.5">
          {serviceItems.map((item) => (
            <button
              onClick={() => toast(`${item.label}: Próximamente`, 'info')}
              class="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                'border-color': 'var(--border-base)',
                color: 'var(--text-primary)',
              }}
            >
              <span
                class="material-symbols-rounded text-lg leading-none"
                style={{ 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20", color: 'var(--accent)' }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
