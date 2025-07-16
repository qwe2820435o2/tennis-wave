import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next-themes with proper implementation
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark', 'system'],
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'sun-icon' }),
  Moon: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'moon-icon' }),
  Plus: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'plus-icon' }),
  Search: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'search-icon' }),
  ArrowLeft: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'arrow-left-icon' }),
  Calendar: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'calendar-icon' }),
  Filter: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'filter-icon' }),
  MapPin: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'map-pin-icon' }),
  Clock: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'clock-icon' }),
  Users: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'users-icon' }),
  User: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'user-icon' }),
  Mail: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'mail-icon' }),
  Phone: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'phone-icon' }),
  Edit: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'edit-icon' }),
  Trash2: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'trash2-icon' }),
  Send: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'send-icon' }),
  MessageCircle: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'message-circle-icon' }),
  Heart: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'heart-icon' }),
  Star: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'star-icon' }),
  Check: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'check-icon' }),
  X: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'x-icon' }),
  XIcon: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'x-icon' }),
  ChevronDownIcon: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'chevron-down-icon' }),
  ChevronUpIcon: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'chevron-up-icon' }),
  ChevronDown: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'chevron-down-icon' }),
  ChevronUp: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'chevron-up-icon' }),
  SlidersHorizontal: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'sliders-horizontal-icon' }),
  CheckIcon: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'check-icon' }),
  ChevronRight: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'chevron-right-icon' }),
  ChevronLeft: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'chevron-left-icon' }),
  Volleyball: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'volleyball-icon' }),
  Trophy: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'trophy-icon' }),
  Eye: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'eye-icon' }),
  EyeOff: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'eye-off-icon' }),
  BarChart3: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bar-chart3-icon' }),
  Target: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'target-icon' }),
  MoreHorizontal: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'more-horizontal-icon' }),
  CircleIcon: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'circle-icon' }),
  Settings: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'settings-icon' }),
  LogOut: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'logout-icon' }),
  // 添加更多可能用到的图标
  AlertCircle: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'alert-circle-icon' }),
  Info: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'info-icon' }),
  ExternalLink: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'external-link-icon' }),
  Download: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'download-icon' }),
  Upload: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'upload-icon' }),
  Copy: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'copy-icon' }),
  Share: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'share-icon' }),
  Lock: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'lock-icon' }),
  Unlock: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'unlock-icon' }),
  Shield: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'shield-icon' }),
  Bell: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bell-icon' }),
  Home: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'home-icon' }),
  Menu: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'menu-icon' }),
  Grid: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'grid-icon' }),
  List: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'list-icon' }),
  Maximize: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'maximize-icon' }),
  Minimize: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'minimize-icon' }),
  RotateCcw: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'rotate-ccw-icon' }),
  RotateCw: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'rotate-cw-icon' }),
  ZoomIn: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'zoom-in-icon' }),
  ZoomOut: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'zoom-out-icon' }),
  // 添加更多可能用到的图标
  ArrowRight: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'arrow-right-icon' }),
  ArrowUp: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'arrow-up-icon' }),
  ArrowDown: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'arrow-down-icon' }),
  Minus: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'minus-icon' }),
  Divide: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'divide-icon' }),
  Multiply: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'multiply-icon' }),
  Percent: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'percent-icon' }),
  Hash: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'hash-icon' }),
  AtSign: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'at-sign-icon' }),
  DollarSign: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'dollar-sign-icon' }),
  Euro: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'euro-icon' }),
  PoundSterling: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'pound-sterling-icon' }),
  Yen: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'yen-icon' }),
  Bitcoin: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bitcoin-icon' }),
  CreditCard: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'credit-card-icon' }),
  Wallet: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'wallet-icon' }),
  Receipt: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'receipt-icon' }),
  Tag: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'tag-icon' }),
  Tags: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'tags-icon' }),
  Bookmark: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bookmark-icon' }),
  BookOpen: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'book-open-icon' }),
  FileText: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-text-icon' }),
  File: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-icon' }),
  Folder: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'folder-icon' }),
  FolderOpen: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'folder-open-icon' }),
  Image: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'image-icon' }),
  Video: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'video-icon' }),
  Music: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'music-icon' }),
  Headphones: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'headphones-icon' }),
  Speaker: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'speaker-icon' }),
  Mic: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'mic-icon' }),
  MicOff: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'mic-off-icon' }),
  Camera: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'camera-icon' }),
  CameraOff: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'camera-off-icon' }),
  Monitor: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'monitor-icon' }),
  Smartphone: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'smartphone-icon' }),
  Tablet: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'tablet-icon' }),
  Laptop: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'laptop-icon' }),
  Printer: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'printer-icon' }),
  Wifi: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'wifi-icon' }),
  WifiOff: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'wifi-off-icon' }),
  Bluetooth: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bluetooth-icon' }),
  Battery: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'battery-icon' }),
  BatteryCharging: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'battery-charging-icon' }),
  Power: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'power-icon' }),
  PowerOff: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'power-off-icon' }),
  Zap: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'zap-icon' }),
  ZapOff: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'zap-off-icon' }),
  Activity: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'activity-icon' }),
  TrendingUp: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'trending-up-icon' }),
  TrendingDown: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'trending-down-icon' }),
  PieChart: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'pie-chart-icon' }),
  LineChart: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'line-chart-icon' }),
  BarChart: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bar-chart-icon' }),
  BarChart2: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bar-chart2-icon' }),
  BarChart4: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'bar-chart4-icon' }),
  ScatterChart: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'scatter-chart-icon' }),
  GitBranch: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'git-branch-icon' }),
  GitCommit: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'git-commit-icon' }),
  GitMerge: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'git-merge-icon' }),
  GitPullRequest: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'git-pull-request-icon' }),
  Github: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'github-icon' }),
  Gitlab: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'gitlab-icon' }),
  Twitter: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'twitter-icon' }),
  Facebook: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'facebook-icon' }),
  Instagram: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'instagram-icon' }),
  Linkedin: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'linkedin-icon' }),
  Youtube: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'youtube-icon' }),
  Twitch: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'twitch-icon' }),
  Discord: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'discord-icon' }),
  Slack: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'slack-icon' }),
  Inbox: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'inbox-icon' }),
  Archive: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'archive-icon' }),
  ArchiveRestore: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'archive-restore-icon' }),
  Trash: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'trash-icon' }),
  FileX: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-x-icon' }),
  FileCheck: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-check-icon' }),
  FilePlus: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-plus-icon' }),
  FileMinus: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-minus-icon' }),
  FileEdit: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-edit-icon' }),
  FileSearch: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-search-icon' }),
  FileCode: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-code-icon' }),
  FileImage: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-image-icon' }),
  FileVideo: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-video-icon' }),
  FileAudio: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-audio-icon' }),
  FileArchive: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-archive-icon' }),
  FileSpreadsheet: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-spreadsheet-icon' }),
  FileDatabase: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-database-icon' }),
  FileJson: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-json-icon' }),
  FileXml: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-xml-icon' }),
  FileCsv: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-csv-icon' }),
  FilePdf: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-pdf-icon' }),
  FileWord: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-word-icon' }),
  FileExcel: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-excel-icon' }),
  FilePowerpoint: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-powerpoint-icon' }),
  FileType: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-type-icon' }),
  FileType2: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-type2-icon' }),
  FileDigit: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-digit-icon' }),
  FileSymlink: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-symlink-icon' }),
  FileBadge: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-badge-icon' }),
  FileBadge2: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-badge2-icon' }),
  FileInput: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-input-icon' }),
  FileOutput: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-output-icon' }),
  FileScan: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-scan-icon' }),
  FileVolume: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume-icon' }),
  FileVolume2: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume2-icon' }),
  FileVolumeX: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume-x-icon' }),
  FileVolume1: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume1-icon' }),
  FileVolume3: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume3-icon' }),
  FileVolume4: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume4-icon' }),
  FileVolume5: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume5-icon' }),
  FileVolume6: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume6-icon' }),
  FileVolume7: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume7-icon' }),
  FileVolume8: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume8-icon' }),
  FileVolume9: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume9-icon' }),
  FileVolume10: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume10-icon' }),
  FileVolume11: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume11-icon' }),
  FileVolume12: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume12-icon' }),
  FileVolume13: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume13-icon' }),
  FileVolume14: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume14-icon' }),
  FileVolume15: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume15-icon' }),
  FileVolume16: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume16-icon' }),
  FileVolume17: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume17-icon' }),
  FileVolume18: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume18-icon' }),
  FileVolume19: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume19-icon' }),
  FileVolume20: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume20-icon' }),
  FileVolume21: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume21-icon' }),
  FileVolume22: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume22-icon' }),
  FileVolume23: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume23-icon' }),
  FileVolume24: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume24-icon' }),
  FileVolume25: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume25-icon' }),
  FileVolume26: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume26-icon' }),
  FileVolume27: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume27-icon' }),
  FileVolume28: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume28-icon' }),
  FileVolume29: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume29-icon' }),
  FileVolume30: ({ className }: { className?: string }) => 
    React.createElement('svg', { className, 'data-testid': 'file-volume30-icon' }),
}));

// Mock CSS modules
vi.mock('*.module.css', () => ({}));

// Mock image imports
vi.mock('*.png', () => 'test-image.png');
vi.mock('*.jpg', () => 'test-image.jpg');
vi.mock('*.jpeg', () => 'test-image.jpeg');
vi.mock('*.svg', () => 'test-image.svg');

// Mock SignalR service
vi.mock('@/services/signalRService', () => ({
  signalRService: {
    startConnection: vi.fn(),
    stopConnection: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

// Note: authService is not mocked here to allow testing of the actual service
// Individual test files should mock authService if needed

// Note: userService is not mocked here to allow testing of the actual service
// Individual test files should mock userService if needed

// Mock chat service
vi.mock('@/services/chatService', () => ({
  getConversations: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  createConversation: vi.fn(),
}));

// Note: tennisBookingService is not mocked here to allow testing of the actual service
// Individual test files should mock tennisBookingService if needed

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock scrollIntoView method
Element.prototype.scrollIntoView = vi.fn();

// 处理未捕获的 Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  // 在测试环境中，我们可以忽略某些预期的错误
  if (reason instanceof Error && reason.message.includes('Network error')) {
    return;
  }
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 处理 lucide-react 相关的错误
const originalConsoleError = console.error;
console.error = (...args) => {
  // 过滤掉 lucide-react 相关的错误
  if (args[0] && typeof args[0] === 'string' && args[0].includes('lucide-react')) {
    return;
  }
  // 过滤掉 React 相关的警告
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  originalConsoleError.call(console, ...args);
}; 