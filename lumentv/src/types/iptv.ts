export type PlaylistSourceType = 'demo' | 'url' | 'file' | 'text';

export interface Channel {
  id: string;
  playlistId: string;
  name: string;
  streamUrl: string;
  logoUrl?: string;
  category: string;
  tvgId?: string;
  tvgName?: string;
  number?: string;
}

export interface PlaylistSource {
  id: string;
  name: string;
  sourceType: PlaylistSourceType;
  sourceRef?: string;
  epgUrlHint?: string;
  createdAt: number;
  channelCount: number;
  categories: string[];
}

export interface StoredPlaylist {
  meta: PlaylistSource;
  channels: Channel[];
}

export interface EpgProgram {
  id: string;
  channelKey: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  startMs: number;
  endMs: number;
}

export interface EpgSourceInfo {
  name: string;
  sourceType: 'demo' | 'file' | 'url' | 'text';
  loadedAt: number;
  channelCount: number;
  programCount: number;
}

export interface EpgDataset {
  info: EpgSourceInfo;
  /** Indexed by lowercase trimmed channel ID or normalized channel name */
  programsByKey: Record<string, EpgProgram[]>;
  /** Maps normalized display-name -> channel id(s) from XMLTV <channel> tags */
  aliasToKeys: Record<string, string[]>;
}

export type WorkspaceView = 'player' | 'guide' | 'playlists';
export type SidebarScope = 'all' | 'favorites' | 'recent';

export interface UserPreferences {
  activePlaylistId: string;
  activeChannelId: string | null;
  favoriteIds: string[];
  recentIds: string[];
  volume: number;
  muted: boolean;
  epgDrawerOpen: boolean;
  sidebarCollapsed: boolean;
  customUserAgent: string;
  useLocalRelay: boolean;
}

export interface HlsQualityLevel {
  index: number;
  height: number;
  width: number;
  bitrate: number;
  label: string;
}
