/** @jsxImportSource solid-js */
import { createSignal, createEffect, onCleanup } from 'solid-js';

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: () => boolean;
  isLoading: () => boolean;
}

export function useInfiniteScroll(props: UseInfiniteScrollProps) {
  const [observerTarget, setObserverTarget] = createSignal<HTMLDivElement | null>(null);

  createEffect(() => {
    const target = observerTarget();
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && props.hasMore() && !props.isLoading()) {
          props.onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);

    onCleanup(() => observer.disconnect());
  });

  return { setObserverTarget };
}
