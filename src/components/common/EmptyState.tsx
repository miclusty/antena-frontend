/** @jsxImportSource solid-js */
import type { JSX } from 'solid-js';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  class?: string;
}

export default function EmptyState(props: EmptyStateProps) {
  return (
    <div
      class={`flex flex-col items-center justify-center py-16 px-6 text-center ${props.class || ''}`}
    >
      <span
        class="material-symbols-rounded text-5xl mb-4"
        style={{ color: 'var(--text-tertiary)', 'font-variation-settings': "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20", opacity: 0.3 }}
      >
        {props.icon}
      </span>
      <h3
        class="text-base font-semibold mb-1.5"
        style={{ color: 'var(--text-primary)' }}
      >
        {props.title}
      </h3>
      {props.description && (
        <p
          class="text-sm max-w-[280px] leading-relaxed"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {props.description}
        </p>
      )}
      {props.action && (
        <button
          onClick={props.action.onClick}
          class="mt-4 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {props.action.label}
        </button>
      )}
    </div>
  );
}
