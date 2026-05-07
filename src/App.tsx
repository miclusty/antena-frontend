/** @jsxImportSource solid-js */
import { createSignal, createResource, createEffect, createMemo, For, Show, onMount, onCleanup } from 'solid-js';
import type { NewsItem, VoiceBreakdown } from './lib/types';
import { VOICE_COLORS, VOICE_LABELS } from './lib/bias';
import NewsCard from './components/common/NewsCard';
import BottomNav, { type TabId } from './components/common/BottomNav';
import FeedTabs from './components/common/FeedTabs';
import DensityToggle from './components/common/DensityToggle';
import FeaturedCluster from './components/common/FeaturedCluster';
import BiasBreakdownBar from './components/common/BiasBreakdownBar';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ArticleDetail from './components/article/ArticleDetail';
import LocationSelector from './components/common/LocationSelector';
import MenuView from './components/menu/MenuView';
import SintonizarView from './components/categories/SintonizarView';
import BookmarksView from './components/bookmarks/BookmarksView';
import ErrorBoundary from './components/common/ErrorBoundary';
import EmptyState from './components/common/EmptyState';
import ConnectionStatus from './components/ConnectionStatus';
import ToastContainer from './components/Toast';
import PullToRefresh from './components/PullToRefresh';
import { toast } from './components/Toast';
import { useHaptic } from './lib/haptic';
import { cacheNews, getCachedNews, markAsRead } from './lib/db';
import { useInfiniteScroll } from './lib/hooks';
import { saveScrollPos, restoreScrollPos } from './lib/scroll';
import { useBookmarks } from './lib/bookmarks';
import { fetchFeed, fetchNewsById, fetchCategories, fetchStats, fetchBlindspot } from './lib/api';
import { mapNewsCard } from './lib/mappers';
import { parseURLState, updateURL, clearURL } from './lib/urlState';
import TimeFilters, { type TimeFilter } from './components/common/TimeFilters';
import QualityFilters, { type QualityFilter } from './components/common/QualityFilters';
import ModoMate from './components/common/ModoMate';

type ViewType = 'feed' | 'article' | 'sintonizar' | 'menu' | 'bookmarks';

export default function App() {
  const [activeCategory, setActiveCategory] = createSignal('Todas');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [activeLocation, setActiveLocation] = createSignal<string | null>(null);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [currentView, setCurrentView] = createSignal<ViewType>('feed');
  const [categories, setCategories] = createSignal<{ name: string; icon: string; slug: string }[]>([
    { name: 'Todas', icon: 'home', slug: 'all' },
    { name: 'Política', icon: 'gavel', slug: 'politica' },
    { name: 'Economía', icon: 'trending_up', slug: 'economia' },
    { name: 'Deportes', icon: 'sports_soccer', slug: 'deportes' },
    { name: 'Policiales', icon: 'local_police', slug: 'policiales' },
    { name: 'Cultura', icon: 'theater_comedy', slug: 'cultura' },
    { name: 'Tecnología', icon: 'devices', slug: 'tecnologia' },
    { name: 'Sociedad', icon: 'groups', slug: 'sociedad' },
  ]);
  const [stats, setStats] = createSignal({ total_news: 0, active_sources: 0, total_locations: 0 });
  const [offset, setOffset] = createSignal(0);
  const [allNews, setAllNews] = createSignal<NewsItem[]>([]);
  const [hasMore, setHasMore] = createSignal(true);
  const [isLoadingMore, setIsLoadingMore] = createSignal(false);
  const [timeFilter, setTimeFilter] = createSignal<TimeFilter>('all');
  const [biasFilter, setBiasFilter] = createSignal<string | null>(null);
  const [minQualityFilter, setMinQualityFilter] = createSignal<number>(0);
  const [showBlindspot, setShowBlindspot] = createSignal(false);
  const [blindspotItems, setBlindspotItems] = createSignal<any[]>([]);
  const [activeFeedTab, setActiveFeedTab] = createSignal('home');
  const [activeTab, setActiveTab] = createSignal<TabId>('home');
  const [density, setDensity] = createSignal<'compact' | 'comfortable'>(
    (() => { try { return (localStorage.getItem('antena-density') as any) || 'comfortable'; } catch { return 'comfortable'; } })()
  );

  createEffect(() => { try { localStorage.setItem('antena-density', density()); } catch {} });

  const fetchBlindspotData = async () => {
    try {
      const data = await fetchBlindspot(10);
      setBlindspotItems(data.items || []);
    } catch {}
  };

  const haptic = useHaptic();

  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();

  const shareNews = async (news: NewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: news.title, text: news.summary, url: window.location.href });
        toast('Compartido', 'info');
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(`${news.title}\n${news.summary}\n${window.location.href}`);
      toast('Enlace copiado', 'info');
    }
  };

  const [feed, { refetch }] = createResource(
    () => `${activeCategory()}:${searchQuery()}:${activeLocation() ?? 'all'}:${biasFilter() ?? 'all'}:${timeFilter()}:${minQualityFilter()}`,
    async () => {
      try {
        const catParam = activeCategory() === 'Todas' ? undefined : activeCategory();
        const tf = timeFilter();
        const mq = minQualityFilter();
        return await fetchFeed({
          category: catParam,
          location_id: activeLocation() ? parseInt(activeLocation()!) : undefined,
          limit: 20,
          offset: 0,
          bias: biasFilter() ?? undefined,
          time: tf !== 'all' ? tf : undefined,
          min_quality: mq > 0 ? mq : undefined,
        });
      } catch (e) {
        console.error('fetchFeed failed:', e);
        if (typeof window !== 'undefined') {
          const cached = await getCachedNews(50);
          if (cached?.length) {
            toast('Sin conexión — mostrando artículos guardados', 'warning');
            return { news: cached, total: cached.length, page: 1, per_page: cached.length, location: null, category: null };
          }
        }
        throw new Error('Sin conexión y sin caché disponible');
      }
    }
  );

  const resetFeed = () => { setOffset(0); setAllNews([]); setHasMore(true); refetch(); };

  const loadMore = () => {
    if (!hasMore() || isLoadingMore()) return;
    setIsLoadingMore(true);
    const data = feed();
    if (!data?.news) { setIsLoadingMore(false); return; }
    const newItems = data.news.map(mapNewsCard);
    setAllNews(prev => [...prev, ...newItems]);
    setOffset(prev => prev + 20);
    setHasMore(data.news.length >= 20);
    setIsLoadingMore(false);
  };

  const { setObserverTarget } = useInfiniteScroll({ onLoadMore: loadMore, hasMore, isLoading: () => feed.loading });

  createEffect(() => {
    const data = feed();
    if (data?.news && offset() === 0) {
      setAllNews(data.news.map(mapNewsCard));
      setHasMore(data.news.length >= 20);
      cacheNews(data.news).catch(() => {});
    }
  });

  const [selectedNews, setSelectedNews] = createSignal<NewsItem | null>(null);

  const handleViewChange = (view: ViewType) => {
    haptic.vibrate('tap');
    setCurrentView(view);
    if (view === 'feed') { setSelectedId(null); setSelectedNews(null); restoreScrollPos(); }
  };

  const handleNewsClick = async (news: NewsItem) => {
    saveScrollPos();
    markAsRead(news.id);
    setSelectedId(news.id);
    try {
      const card = await fetchNewsById(news.id);
      setSelectedNews(mapNewsCard(card));
    } catch { setSelectedNews(news); }
    setCurrentView('article');
    updateURL({ view: 'article', id: news.id });
  };

  const handleBack = () => {
    setSelectedId(null);
    setSelectedNews(null);
    setCurrentView('feed');
    restoreScrollPos();
    clearURL();
  };

  const mappedNews = createMemo<NewsItem[]>(() => {
    let items = allNews();
    const q = searchQuery().toLowerCase().trim();
    const tf = timeFilter();
    if (tf !== 'all') {
      const now = Date.now();
      const cutoff = tf === 'hour' ? now - 3600000 : tf === 'today' ? now - 86400000 : tf === 'week' ? now - 604800000 : 0;
      items = items.filter(n => new Date(n.publishedAt || n.time || 0).getTime() >= cutoff);
    }
    if (q) items = items.filter(n => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) || n.category.toLowerCase().includes(q));
    return items;
  });

  const featuredNews = createMemo<NewsItem | null>(() => {
    const items = mappedNews();
    if (!items.length) return null;
    return items.reduce((max, item) => item.sourcesCount > max.sourcesCount ? item : max, items[0]);
  });

  const breakingNews = createMemo<NewsItem[]>(() => mappedNews().filter(n => n.signalLevel >= 8));

  const feedBiasVoices = createMemo<VoiceBreakdown[]>(() => {
    let off = 0, neu = 0, opp = 0;
    for (const n of mappedNews()) {
      if (n.bias === 'Oficialista') off++;
      else if (n.bias === 'Opositor') opp++;
      else neu++;
    }
    const total = off + neu + opp || 1;
    return [
      { label: VOICE_LABELS.officialist, color: VOICE_COLORS.officialist, pct: Math.round((off / total) * 100) },
      { label: VOICE_LABELS.neutral, color: VOICE_COLORS.neutral, pct: Math.round((neu / total) * 100) },
      { label: VOICE_LABELS.opposition, color: VOICE_COLORS.opposition, pct: Math.round((opp / total) * 100) },
    ];
  });

  onMount(async () => {
    const urlState = parseURLState();
    if (urlState.category) setActiveCategory(urlState.category);
    if (urlState.locationId) setActiveLocation(urlState.locationId);
    if (urlState.view === 'article' && urlState.articleId) {
      markAsRead(urlState.articleId);
      setSelectedId(urlState.articleId);
      setCurrentView('article');
      try {
        const card = await fetchNewsById(urlState.articleId);
        setSelectedNews(mapNewsCard(card));
      } catch { setSelectedNews(null); }
    }

    const onPopState = async () => {
      const state = parseURLState();
      if (state.view === 'article' && state.articleId) {
        markAsRead(state.articleId);
        setSelectedId(state.articleId);
        setCurrentView('article');
        try { setSelectedNews(mapNewsCard(await fetchNewsById(state.articleId))); } catch { setSelectedNews(null); }
      } else { handleViewChange('feed'); }
      if (state.category) setActiveCategory(state.category);
      if (state.locationId !== null) setActiveLocation(state.locationId);
    };

    window.addEventListener('popstate', onPopState);
    onCleanup(() => window.removeEventListener('popstate', onPopState));

    try {
      const [cats, s] = await Promise.all([
        fetchCategories().catch(() => []),
        fetchStats().catch(() => ({ status: 'ok', stats: { total_news: 0, active_sources: 0, total_locations: 0 } })),
      ]);
      if (cats.length > 0) setCategories([{ name: 'Todas', icon: 'home', slug: 'all' }, ...cats.map(c => ({ name: c.name, icon: c.icon, slug: c.slug }))]);
      setStats(s.stats);
    } catch (e) { toast('Error al cargar categorias', 'warning'); }
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <ConnectionStatus />
      <ToastContainer />

      {/* Shell */}
      <div class="min-h-screen bg-bg-base">

        {/* Header */}
        <Header
          activeCategory={activeCategory()}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            updateURL({ cat: cat === 'Todas' ? null : cat });
            setSearchQuery('');
            handleViewChange('feed');
            resetFeed();
          }}
          onSearch={(query) => setSearchQuery(query)}
        />

        {/* Location bar */}
        <Show when={currentView() === 'feed'}>
          <div class="px-4 py-1.5">
            <LocationSelector
              activeLocation={activeLocation()}
              onLocationChange={(locId) => {
                setActiveLocation(locId);
                updateURL({ loc: locId });
                handleViewChange('feed');
                resetFeed();
              }}
            />
          </div>
        </Show>

        {/* ── Feed view ── */}
        <Show when={currentView() === 'feed'}>
          {/* Sticky FeedTabs */}
          <div class="sticky top-[56px] z-30 bg-bg-elevated backdrop-blur-md border-b border-border-base">
            <div class="max-w-feed mx-auto">
              <FeedTabs
                activeTab={activeFeedTab()}
                onTabChange={(id) => { haptic.vibrate('tap'); setActiveFeedTab(id); resetFeed(); }}
              />
            </div>
          </div>

          {/* Feed content — error / loading / empty / news */}
          <Show
            when={!feed.error}
            fallback={
              <div class="max-w-feed mx-auto px-4 py-8">
                <EmptyState
                  icon="wifi_off"
                  title="No se pudieron cargar las noticias"
                  description="Revisá tu conexión a internet y volvé a intentarlo."
                  action={{ label: 'Reintentar', onClick: () => { resetFeed(); refetch(); } }}
                />
              </div>
            }
          >
            <Show
              when={!feed.loading || offset() > 0}
              fallback={
                /* Initial loading skeletons */
                <div class="max-w-feed mx-auto px-4">
                  <div class="flex flex-col">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div class="bg-bg-elevated border-b border-border-base px-4 py-4">
                        <div class="flex items-center gap-3 mb-4">
                          <div class="w-10 h-10 rounded-full bg-bg-hover animate-pulse" />
                          <div class="flex-1">
                            <div class="h-3 w-24 bg-bg-hover rounded animate-pulse mb-1.5" />
                            <div class="h-2.5 w-16 bg-bg-hover rounded animate-pulse" />
                          </div>
                        </div>
                        <div class="h-4 w-3/4 bg-bg-hover rounded animate-pulse mb-2" />
                        <div class="h-3 w-1/2 bg-bg-hover rounded animate-pulse mb-3" />
                        <div class="flex items-center gap-4">
                          <div class="h-5 w-12 bg-bg-hover rounded animate-pulse" />
                          <div class="h-5 w-12 bg-bg-hover rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              <Show
                when={mappedNews().length > 0}
                fallback={
                  <div class="max-w-feed mx-auto px-4 py-8">
                    <EmptyState
                      icon="inbox"
                      title="No hay noticias"
                      description="No se encontraron noticias. Volvé a intentar más tarde."
                    />
                  </div>
                }
              >
                <PullToRefresh onRefresh={async () => { resetFeed(); }}>
                  <div class="max-w-feed mx-auto">
                    {/* Featured cluster */}
                    <Show when={featuredNews() && !searchQuery()}>
                      <div class="px-4 pt-3">
                        <FeaturedCluster
                          news={featuredNews()!}
                          onClick={() => handleNewsClick(featuredNews()!)}
                        />
                      </div>
                    </Show>

                    {/* Breaking news banner */}
                    <Show when={breakingNews().length > 0 && !searchQuery()}>
                      <div class="px-4 py-2">
                        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
                          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                          <span class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                            {breakingNews().length} en alta propagación
                          </span>
                        </div>
                      </div>
                    </Show>

                    {/* Bias distribution */}
                    <Show when={!searchQuery()}>
                      <div class="px-4 py-2">
                        <div class="bg-bg-elevated rounded-lg border border-border-base p-3">
                          <div class="flex items-center justify-between mb-2">
                            <h3 class="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Sesgo del feed</h3>
                            <span class="text-[10px] text-text-tertiary">{mappedNews().length} noticias</span>
                          </div>
                          <BiasBreakdownBar voices={feedBiasVoices()} />
                        </div>
                      </div>
                    </Show>

                    {/* Filters row */}
                    <div class="px-4 py-2 flex items-center gap-2 flex-wrap">
                      <TimeFilters activeFilter={timeFilter()} onFilterChange={(f) => { setTimeFilter(f); resetFeed(); }} />
                      <QualityFilters activeFilter={minQualityFilter()} onFilterChange={(f) => { setMinQualityFilter(f); resetFeed(); }} />
                      <DensityToggle density={density()} onChange={(d) => setDensity(d)} />
                    </div>

                    {/* Bias filter chips */}
                    <div class="px-4 pb-2 flex items-center gap-2 flex-wrap">
                      {([
                        { label: 'Todas', value: null, color: '#8A8D97' },
                        { label: 'Oficialista', value: 'officialist', color: '#75AADB' },
                        { label: 'Neutral', value: 'neutral', color: '#8A8D97' },
                        { label: 'Opositor', value: 'opposition', color: '#F5C542' },
                      ] as const).map((f) => (
                        <button
                          onClick={() => { setBiasFilter(f.value); haptic.vibrate('tap'); resetFeed(); }}
                          class="text-[11px] px-2.5 py-1 rounded-full border transition-all whitespace-nowrap"
                          style={biasFilter() === f.value
                            ? { 'background-color': f.color, 'border-color': f.color, color: '#fff' }
                            : { 'border-color': 'var(--border)', color: 'var(--text-secondary)' }
                          }
                        >
                          {f.label}
                        </button>
                      ))}
                      <button
                        onClick={() => { haptic.vibrate('tap'); setShowBlindspot(!showBlindspot()); if (!showBlindspot()) fetchBlindspotData(); }}
                        class="text-[11px] px-2.5 py-1 rounded-full border transition-all"
                        style={showBlindspot()
                          ? { 'background-color': 'rgba(245,158,11,0.15)', 'border-color': '#F59E0B', color: '#F59E0B' }
                          : { 'border-color': 'var(--border)', color: 'var(--text-secondary)' }
                        }
                      >
                        Puntos ciegos
                      </button>
                    </div>

                    {/* News cards */}
                    <div class="flex flex-col max-w-[600px] mx-auto lg:max-w-none lg:w-full">
                      <For each={mappedNews()}>
                        {(item) => (
                          <NewsCard
                            news={item}
                            onClick={() => handleNewsClick(item)}
                            variant={density() === 'compact' ? 'compact' : 'default'}
                            onUpvote={() => haptic.vibrate('tap')}
                            onBookmark={() => { haptic.vibrate('tap'); toggleBookmark(item.id); }}
                            onShare={() => shareNews(item)}
                            onRepost={() => haptic.vibrate('tap')}
                          />
                        )}
                      </For>
                    </div>

                    {/* Infinite scroll sentinel */}
                    <div ref={setObserverTarget} class="h-1" />

                    {/* Loading more */}
                    <Show when={feed.loading && offset() > 0}>
                      <div class="flex justify-center py-6">
                        <div class="flex items-center gap-2 text-text-tertiary text-sm">
                          <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Cargando más...
                        </div>
                      </div>
                    </Show>
                  </div>
                </PullToRefresh>
              </Show>
            </Show>
          </Show>
        </Show>

        {/* ── Desktop Sidebar (lg+) ── */}
        <Show when={currentView() === 'feed'}>
          <Sidebar
            activeCategory={activeCategory()}
            onCategoryChange={(cat) => { setActiveCategory(cat); resetFeed(); }}
            stats={stats()}
            news={allNews()}
            categories={categories()}
          />
        </Show>

        {/* ── Article view ── */}
        <Show when={currentView() === 'article' && selectedNews()}>
          <div class="fixed inset-0 z-50 bg-bg-base lg:static lg:z-auto lg:inset-auto overflow-y-auto">
            <ArticleDetail
              news={selectedNews()!}
              onBack={handleBack}
              onArticleSelect={(article) => {
                setSelectedNews(article);
                updateURL({ view: 'article', id: article.id });
              }}
            />
          </div>
        </Show>

        {/* ── Sintonizar view ── */}
        <Show when={currentView() === 'sintonizar'}>
          <SintonizarView
            onCategorySelect={(cat) => {
              setActiveCategory(cat);
              updateURL({ cat: cat === 'Todas' ? null : cat });
              handleViewChange('feed');
              resetFeed();
            }}
          />
        </Show>

        {/* ── Menu view ── */}
        <Show when={currentView() === 'menu'}>
          <MenuView onNavigate={(view) => handleViewChange(view)} stats={stats()} savedCount={bookmarks().length} />
        </Show>

        {/* ── Bookmarks view ── */}
        <Show when={currentView() === 'bookmarks'}>
          <BookmarksView onBack={() => handleViewChange('feed')} onNewsClick={handleNewsClick} />
        </Show>

      </div>

      {/* Bottom Nav — mobile only, hidden during article */}
      <Show when={currentView() !== 'article'}>
        <BottomNav
          activeTab={activeTab()}
          onTabChange={(tab) => {
            haptic.vibrate('tap');
            setActiveTab(tab);
            if (tab === 'home') handleViewChange('feed');
            else if (tab === 'discover') handleViewChange('sintonizar');
            else if (tab === 'bookmarks') handleViewChange('bookmarks');
            else if (tab === 'menu') handleViewChange('menu');
          }}
        />
      </Show>

      {/* Modo Mate — floating button during article */}
      <Show when={currentView() === 'article'}>
        <ModoMate
          visible={true}
          newsItems={mappedNews().map(n => ({ title: n.title, summary: n.summary }))}
          currentIndex={0}
        />
      </Show>

    </ErrorBoundary>
  );
}