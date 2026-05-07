import { createSignal, onCleanup, onMount } from "solid-js";

export default function ConnectionStatus() {
  const [online, setOnline] = createSignal(typeof navigator !== 'undefined' ? navigator.onLine : true);

  onMount(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    onCleanup(() => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    });
  });

  if (online()) return null;

  return (
    <div
      class="fixed top-16 left-4 right-4 z-[60] bg-red-600/95 backdrop-blur text-white px-4 py-2.5 rounded-lg text-center text-xs font-medium shadow-lg"
      style={{ 'margin-bottom': '0' }}
    >
      Sin conexión — mostrando artículos guardados
    </div>
  );
}
