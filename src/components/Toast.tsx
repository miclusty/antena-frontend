import { For } from 'solid-js';
import { Portal } from 'solid-js/web';
import { createStore } from 'solid-js/store';

type ToastVariant = 'success' | 'warning' | 'error' | 'info';
interface ToastItem { id: number; message: string; variant: ToastVariant; }

const [toasts, setToasts] = createStore<ToastItem[]>([]);
let nextId = 0;

export function toast(message: string, variant: ToastVariant = 'info') {
  const id = nextId++;
  setToasts([...toasts, { id, message, variant }]);
  setTimeout(() => setToasts(toasts.filter(t => t.id !== id)), 2500);
}

const variantBg: Record<ToastVariant, string> = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: 'var(--bg-elevated)',
};

const variantBorder: Record<ToastVariant, string> = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: 'var(--border-base)',
};

const variantColor: Record<ToastVariant, string> = {
  success: '#fff',
  warning: '#fff',
  error: '#fff',
  info: 'var(--text-primary)',
};

export default function ToastContainer() {
  return (
    <Portal>
      <div
        class="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none"
        style={{ 'padding-bottom': 'env(safe-area-inset-bottom, 0px)' }}
      >
        <For each={toasts}>
          {(t) => (
            <div
              class="px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-slide-up pointer-events-auto"
              style={{
                background: variantBg[t.variant],
                color: variantColor[t.variant],
                border: `1px solid ${variantBorder[t.variant]}`,
              }}
            >
              {t.message}
            </div>
          )}
        </For>
      </div>
    </Portal>
  );
}
