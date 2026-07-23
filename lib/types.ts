/**
 * API object shapes — mirrors app/Http/Resources/* in the Laravel backend.
 * Every playable/followable object carries a `type` discriminator.
 */

export type PlayableType =
  | "song"
  | "audio_asset"
  | "podcast_episode"
  | "episode"
  | "story";

export type FollowableType = "artist" | "programme" | "podcast_channel" | "playlist";

export interface AudioAsset {
  id: number;
  type: "audio_asset";
  content_type: string;
  archive_no: string;
  title: string;
  title_bn: string | null;
  slug: string;
  description: string | null;
  duration_seconds: number | null;
  artwork_url: string | null;
  category?: string | null;
  language?: string | null;
  station?: string | null;
  programme?: string | null;
  artists?: Artist[];
  is_premium: boolean;
  is_public_service: boolean;
  content_warning: string | null;
  first_broadcast_on: string | null;
  play_count: number;
  favorite_count: number;
  avg_rating: number | null;
  rating_count: number;
  allow_comments: boolean;
  waveform?: number[] | null;
  is_favorited?: boolean;
  my_rating?: number | null;
}

export interface Song {
  id: number;
  type: "song";
  title: string | null;
  title_bn: string | null;
  archive_no: string | null;
  audio_asset_id: number;
  duration_seconds: number | null;
  artwork_url: string | null;
  genre: string | null;
  mood: string | null;
  version_type: string | null;
  release_year: number | null;
  is_premium: boolean;
  play_count: number | null;
  avg_rating: number | null;
  singers?: string[];
  album?: Album | null;
  lyrics?: { en: string | null; bn: string | null };
  waveform?: number[] | null;
  is_favorited?: boolean;
}

export interface Album {
  id: number;
  type: "album";
  title: string;
  title_bn: string | null;
  slug: string;
  album_type: string | null;
  year: number | null;
  artwork_url: string | null;
  description: string | null;
  artists?: Artist[];
  tracks_count?: number;
  tracks?: Song[];
}

export interface Artist {
  id: number;
  type: "artist";
  name: string;
  name_bn: string | null;
  slug: string;
  artist_type: string | null;
  photo_url: string | null;
  is_featured: boolean;
  followers_count: number;
  bio?: string | null;
  bio_bn?: string | null;
  is_following?: boolean;
}

export interface Programme {
  id: number;
  type: "programme";
  title: string;
  title_bn: string | null;
  slug: string;
  programme_type: string | null;
  description: string | null;
  artwork_url: string | null;
  station?: string | null;
  category?: string | null;
  followers_count: number;
  episodes_count?: number;
  is_following?: boolean;
}

export interface Episode {
  id: number;
  type: "episode";
  title: string;
  title_bn: string | null;
  slug: string;
  number: number | null;
  description: string | null;
  programme?: string | null;
  programme_id: number;
  audio_asset_id: number | null;
  broadcast_date: string | null;
  duration_seconds: number | null;
  artwork_url: string | null;
  play_count: number;
  stories?: Story[];
}

export interface Story {
  id: number;
  type: "story";
  title: string;
  title_bn: string | null;
  slug: string;
  summary: string | null;
  storyteller: string | null;
  narrator: string | null;
  district: string | null;
  category?: string | null;
  start_seconds: number | null;
  end_seconds: number | null;
  content_warning: string | null;
  episode_id: number;
  play_count: number;
}

export interface PodcastChannel {
  id: number;
  type: "podcast_channel";
  title: string;
  title_bn: string | null;
  slug: string;
  description: string | null;
  artwork_url: string | null;
  category?: string | null;
  followers_count: number;
  episodes_count?: number;
  rss_url: string | null;
  episodes?: PodcastEpisode[];
  is_following?: boolean;
}

export interface PodcastEpisode {
  id: number;
  type: "podcast_episode";
  title: string;
  title_bn: string | null;
  slug: string;
  description: string | null;
  channel?: PodcastChannel | null;
  channel_id: number;
  audio_asset_id: number | null;
  season_number: number | null;
  episode_number: number | null;
  duration_seconds: number | null;
  artwork_url: string | null;
  is_premium: boolean;
  published_at: string | null;
  chapters: { title: string; start_seconds: number }[] | null;
  play_count: number;
  hosts?: string[];
}

export interface PlaylistItem {
  position: number;
  playable_type: string;
  playable_id: number;
  playable: Song | AudioAsset | PodcastEpisode | null;
  id?: number;
}

export interface Playlist {
  id: number;
  type: "playlist";
  title: string;
  title_bn: string | null;
  slug: string;
  description: string | null;
  artwork_url: string | null;
  is_editorial: boolean;
  is_owner?: boolean;
  is_public?: boolean;
  owner?: string | null;
  followers_count: number | null;
  is_following?: boolean;
  items_count?: number;
  items?: PlaylistItem[];
}

// ---- Live broadcasting (M27) ----

export interface LiveChannel {
  id: number;
  type: "live_channel";
  title: string;
  title_bn: string | null;
  slug: string;
  description: string | null;
  artwork_url: string | null;
  station?: string | null;
  is_live: boolean;
  started_at: string | null;
  listener_count: number;
  broadcaster: string | null;
  session_title: string | null;
}

export interface LiveTokenResponse {
  ws_url: string;
  token: string;
  room: string;
}

/** Anything that can appear in a home-section row or search results. */
export type CatalogueItem =
  | AudioAsset
  | Song
  | Album
  | Artist
  | Programme
  | Episode
  | Story
  | PodcastChannel
  | PodcastEpisode
  | Playlist;

// ---- Home ----

export interface Banner {
  id: number;
  title: string;
  title_bn: string | null;
  subtitle: string | null;
  image_url: string | null;
  target_type: string | null;
  target_value: string | null;
}

export interface HomeSection {
  id: number;
  title: string;
  title_bn: string | null;
  type: string;
  layout: string;
  items: CatalogueItem[];
}

export interface HomeResponse {
  banners: Banner[];
  sections: HomeSection[];
}

// ---- Auth / user ----

export interface Entitlements {
  plan: string;
  is_premium: boolean;
  is_authenticated?: boolean;
  ads_enabled: boolean;
  max_quality_kbps: number;
  skips_per_hour: number | null;
  offline_downloads: boolean;
  equalizer: boolean;
  premium_content_access: "preview" | "full";
  preview_seconds: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  locale: "en" | "bn";
  avatar_url?: string | null;
  is_premium?: boolean;
  preferences?: Record<string, unknown> | null;
  entitlements?: Entitlements;
}

export interface TokenResponse {
  message: string;
  token: string;
  token_type: "Bearer";
  user: User;
}

// ---- Playback ----

export interface StreamDescriptor {
  version: string;
  url: string;
  expires_at: string;
  duration_seconds: number;
  is_preview: boolean;
  bitrate_kbps: number;
}

export interface AdDescriptor {
  id: number;
  title: string;
  type: string;
  duration_seconds: number;
  slot: string;
  audio_url: string;
}

export interface StreamResponse {
  asset_id: number;
  title: string;
  stream: StreamDescriptor;
  ad: AdDescriptor | null;
  requires_login_for_full: boolean;
}

export type PlayEventType =
  | "play"
  | "pause"
  | "seek"
  | "replay"
  | "skip"
  | "progress"
  | "complete";

// ---- Search ----

export interface SearchResults {
  query: string;
  results: {
    songs?: { data: Song[] };
    artists?: { data: Artist[] };
    albums?: { data: Album[] };
    podcasts?: { data: PodcastChannel[] };
    audio?: { data: AudioAsset[] };
  };
}

export interface Suggestion {
  text: string;
  type: "title" | "artist" | "album";
}

// ---- Library ----

export interface HistoryEntry {
  progress_seconds: number;
  completed?: boolean;
  last_played_at?: string | null;
  asset: AudioAsset | null;
}

export interface QueueState {
  items: { type: string; id: number }[];
  repeat_mode: "off" | "all" | "one";
  shuffle: boolean;
}

// ---- Engagement ----

export interface Comment {
  id: number;
  body: string;
  rating?: number | null;
  status: string;
  author?: string | null;
  user_id: number;
  is_mine?: boolean;
  created_at: string | null;
}

export interface RatingAggregate {
  avg_rating: number;
  rating_count: number;
  your_rating: number;
}

export interface PostCommentResponse {
  message: string;
  data: Comment | null;
  rating: RatingAggregate | null;
}

// ---- Subscription ----

export interface Plan {
  id: number;
  code: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  currency: string;
  trial_days: number;
  features: Record<string, unknown> | null;
}

export interface SubscriptionState {
  plan: string | null;
  status: string;
  billing_cycle: string | null;
  started_at: string | null;
  ends_at: string | null;
  trial_ends_at: string | null;
  auto_renew: boolean;
}

export interface SubscriptionStatus {
  entitlements: Entitlements;
  subscription: SubscriptionState | null;
}

export interface PaymentRecord {
  invoice_no: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paid_at: string | null;
}

// ---- Misc ----

export interface Taxonomy {
  id: number;
  name: string;
  name_bn: string | null;
  slug: string;
}

export interface Paginated<T> {
  data: T[];
  links?: { first?: string; last?: string; prev?: string | null; next?: string | null };
  meta?: { current_page: number; last_page?: number; total?: number; per_page?: number };
}
