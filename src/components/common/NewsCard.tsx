/** @jsxImportSource solid-js */
import { createSignal, createMemo, Show } from 'solid-js';
import type { NewsItem, VoiceBreakdown } from '../../lib/types';
import { getBiasGradientColor, VOICE_LABELS } from '../../lib/bias';
import { useHaptic } from '../../lib/haptic';
import { isRead } from '../../lib/db';

// ─── Avatar placeholders ─────────────────────────────────────
const AVATAR_COLORS = [
  '#FF4D5A', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#06B6D4', '#EC4899', '#EF4444',
];

function getAvatarColor(sourceName: string): string {
  let hash = 0;
  for (let i = 0; i < sourceName.length; i++) {
    hash = (hash * 31 + sourceName.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Category badge ──────────────────────────────────────────
const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  'Política':      { bg: 'rgba(255,77,90,0.12)',  text: '#FF4D5A' },
  'Economía':      { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  'Deportes':      { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  'Policiales':    { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444' },
  'Cultura':       { bg: 'rgba(139,92,246,0.12)', text: '#8B5CF6' },
  'Tecnología':    { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  'Sociedad':      { bg: 'rgba(6,182,212,0.12)',  text: '#06B6D4' },
  'Internacional': { bg: 'rgba(99,102,241,0.12)', text: '#6366F1' },
  'Generales':     { bg: 'rgba(107,114,128,0.12)', text: '#6B7280' },
};

// ─── Social action icons (inline SVG, no dependency) ─────────
function IconUpvote(props: { filled: boolean; color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={props.filled ? props.color : 'none'} stroke={props.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function IconDownvote(props: { filled: boolean; color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={props.filled ? props.color : 'none'} stroke={props.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

function IconComment() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconRepost() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function IconBookmark(props: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={props.filled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

// ─── Props ───────────────────────────────────────────────────
export interface NewsCardProps {
  news: NewsItem;
  onClick: () => void;
  variant?: 'default' | 'compact' | 'article';
  onUpvote?: (id: string, delta: 1 | -1) => void;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  onRepost?: (id: string) => void;
}

export default function NewsCard(props: NewsCardProps) {
  const haptic = useHaptic();
  const variant = () => props.variant || 'default';
  const compact = () => variant() === 'compact';

  // ── Votes state (local, ephemeral) ──
  const [voteState, setVoteState] = createSignal<0 | 1 | -1>(0);  // 0=none, 1=up, -1=down
  const [voteCount, setVoteCount] = createSignal(
    Math.floor(Math.random() * 200) + 10  // placeholder until real data
  );
  const [commentCount] = createSignal(
    Math.floor(Math.random() * 50)  // placeholder
  );
  const [repostCount] = createSignal(
    Math.floor(Math.random() * 20)  // placeholder
  );

  const handleVote = (delta: 1 | -1, e: Event) => {
    e.stopPropagation();
    haptic.vibrate('tap');
    const current = voteState();
    const newState = current === delta ? 0 : delta;
    setVoteState(newState as 0 | 1 | -1);

    // Adjust count
    let diff = 0;
    if (current === delta) diff = -delta;         // undo
    else if (current === 0) diff = delta;         // new vote
    else diff = delta * 2;                        // flip
    setVoteCount(c => Math.max(0, c + diff));

    props.onUpvote?.(props.news.id, delta);
  };

  const handleBookmark = (e: Event) => {
    e.stopPropagation();
    haptic.vibrate('tap');
    props.onBookmark?.(props.news.id);
  };

  const handleShare = (e: Event) => {
    e.stopPropagation();
    haptic.vibrate('tap');
    props.onShare?.(props.news.id);
  };

  const handleRepost = (e: Event) => {
    e.stopPropagation();
    haptic.vibrate('tap');
    props.onRepost?.(props.news.id);
  };

  // ── Derived ──
  const read = createMemo(() => isRead(props.news.id));
  const biasColor = () => getBiasGradientColor(props.news.biasScore ?? 0);
  const catStyle = createMemo(() => CATEGORY_STYLES[props.news.category] || { bg: 'rgba(107,114,128,0.12)', text: '#6B7280' });
  const avatarColor = createMemo(() => getAvatarColor(props.news.source));
  const initials = createMemo(() => getInitials(props.news.source));

  const timeAgo = createMemo(() => {
    const pubDate = new Date(props.news.publishedAt || props.news.time || Date.now());
    const now = Date.now();
    const diff = now - pubDate.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  });

  const upvoteColor = createMemo(() => voteState() === 1 ? 'var(--accent)' : 'var(--text-tertiary)');
  const downvoteColor = createMemo(() => voteState() === -1 ? '#75AADB' : 'var(--text-tertiary)');

  // ─── Compact variant ────────────────────────────────────────
  if (compact()) {
    return (
      <article
        onClick={props.onClick}
        class="flex items-center gap-3 px-4 py-3 border-b border-border-base hover:bg-bg-hover cursor-pointer transition-colors"
        classList={{ 'opacity-60': read() }}
      >
        {/* Left: title + meta */}
        <div class="flex-1 min-w-0">
          <Show when={props.news.category}>
            <span class="text-[10px] font-semibold uppercase tracking-wider" style={{ color: catStyle().text }}>
              {props.news.category}
            </span>
          </Show>
          <h3
            class="text-sm font-medium truncate mt-0.5"
            classList={{ 'text-text-primary': true, 'opacity-60': read() }}
          >
            {props.news.title}
          </h3>
          <div class="flex items-center gap-1.5 mt-1 text-xs text-text-tertiary">
            <span class="font-medium">{props.news.source}</span>
            <span>·</span>
            <span>{timeAgo()}</span>
            <Show when={props.news.sourcesCount > 1}>
              <span>·</span>
              <span class="text-accent">{props.news.sourcesCount} fuentes</span>
            </Show>
          </div>
        </div>

        {/* Right: more icon */}
        <button
          onClick={(e) => { e.stopPropagation(); }}
          class="p-1 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Más opciones"
        >
          <IconMore />
        </button>
      </article>
    );
  }

  // ─── Default (full card) variant ────────────────────────────
  return (
    <article
      onClick={props.onClick}
      class="bg-bg-elevated border-b border-border-base hover:bg-bg-hover cursor-pointer transition-colors duration-100 active:scale-[0.995]"
      classList={{ 'opacity-70': read() }}
    >
      <div class="px-4 pt-3 pb-2">
        {/* ── Top row: avatar + user info ── */}
        <div class="flex items-start gap-3">
          {/* Avatar with bias ring */}
          <div class="relative shrink-0">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white select-none"
              style={{ 'background-color': avatarColor() }}
            >
              {initials()}
            </div>
            {/* Bias ring */}
            <div
              class="absolute inset-0 rounded-full border-2"
              style={{ 'border-color': biasColor(), opacity: 0.6 }}
            />
          </div>

          {/* User + meta */}
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-sm font-semibold text-text-primary leading-tight">
                {props.news.source}
              </span>
              <span class="text-text-tertiary text-xs">·</span>
              <span class="text-text-tertiary text-xs font-mono">{timeAgo()}</span>
              <Show when={props.news.category}>
                <span
                  class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                  style={{ 'background-color': catStyle().bg, color: catStyle().text }}
                >
                  {props.news.category}
                </span>
              </Show>
            </div>
            <div class="text-xs text-text-secondary mt-0.5">
              <span>{props.news.location}</span>
              <Show when={props.news.sourcesCount > 1}>
                <span class="text-text-tertiary"> · </span>
                <span class="text-accent font-medium">{props.news.sourcesCount} fuentes</span>
              </Show>
            </div>
          </div>

          {/* More button */}
          <button
            onClick={(e) => { e.stopPropagation(); }}
            class="p-1 text-text-tertiary hover:text-text-secondary transition-colors shrink-0"
            aria-label="Más opciones"
          >
            <IconMore />
          </button>
        </div>

        {/* ── Title ── */}
        <h2
          class="text-lg font-semibold leading-snug mt-2"
          classList={{ 'text-text-primary': true, 'opacity-60': read() }}
        >
          {props.news.title}
        </h2>

        {/* ── Summary (1 line) ── */}
        <p class="text-sm text-text-secondary mt-1 leading-snug line-clamp-1">
          {props.news.summary}
        </p>

        {/* ── Social actions row ── */}
        <div class="flex items-center gap-1 mt-3 -ml-2">
          {/* Upvote */}
          <button
            onClick={(e) => handleVote(1, e)}
            class="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-accent-muted transition-colors group"
            aria-label="Upvote"
          >
            <IconUpvote filled={voteState() === 1} color={upvoteColor()} />
            <span
              class="text-xs font-medium transition-colors"
              style={{ color: upvoteColor() }}
            >
              {voteCount() > 999 ? `${(voteCount() / 1000).toFixed(1)}k` : voteCount()}
            </span>
          </button>

          {/* Downvote */}
          <button
            onClick={(e) => handleVote(-1, e)}
            class="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-blue-500/10 transition-colors"
            aria-label="Downvote"
          >
            <IconDownvote filled={voteState() === -1} color={downvoteColor()} />
          </button>

          {/* Divider */}
          <div class="w-px h-4 bg-border-base mx-1" />

          {/* Comment */}
          <button
            onClick={(e) => { e.stopPropagation(); haptic.vibrate('tap'); }}
            class="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-bg-hover transition-colors text-text-tertiary hover:text-text-secondary group"
            aria-label="Comentarios"
          >
            <IconComment />
            <span class="text-xs font-medium group-hover:text-text-secondary">
              {commentCount() > 0 ? (commentCount() > 999 ? `${(commentCount() / 1000).toFixed(1)}k` : commentCount()) : ''}
            </span>
          </button>

          {/* Repost */}
          <button
            onClick={(e) => handleRepost(e)}
            class="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-bg-hover transition-colors text-text-tertiary hover:text-text-secondary group"
            aria-label="Repostear"
          >
            <IconRepost />
            <span class="text-xs font-medium group-hover:text-text-secondary">
              {repostCount() > 0 ? (repostCount() > 999 ? `${(repostCount() / 1000).toFixed(1)}k` : repostCount()) : ''}
            </span>
          </button>

          {/* Spacer */}
          <div class="flex-1" />

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            class="p-1.5 rounded-full hover:bg-bg-hover transition-colors text-text-tertiary hover:text-text-secondary"
            aria-label="Guardar"
          >
            <IconBookmark filled={false} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            class="p-1.5 rounded-full hover:bg-bg-hover transition-colors text-text-tertiary hover:text-text-secondary"
            aria-label="Compartir"
          >
            <IconShare />
          </button>
        </div>

        {/* ── Voices breakdown (if multi-source) ── */}
        <Show when={props.news.sourcesCount > 1 && props.news.voices?.length > 0}>
          <div class="flex items-center gap-2 mt-2 pt-2 border-t border-border-base">
            <span class="text-[10px] text-text-tertiary font-medium">Voces:</span>
            <div class="flex items-center gap-1.5">
              {props.news.voices.map((v: VoiceBreakdown) => (
                <span
                  class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    'background-color': `${v.color}20`,
                    color: v.color,
                  }}
                >
                  {v.label} {v.pct}%
                </span>
              ))}
            </div>
          </div>
        </Show>
      </div>
    </article>
  );
}