import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter';

export interface ReelItem {
  id: string;
  title: string;
  url: string;
  platform: SocialPlatform;
  author?: string;
  videoId?: string;
  thumbnail?: string;
  duration?: number;
  addedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  reels: ReelItem[];
  tags?: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to extract video ID from various platform URLs
export function extractVideoId(url: string, platform: SocialPlatform): string | null {
  try {
    const urlObj = new URL(url);
    
    switch(platform) {
      case 'youtube':
        // Handle both youtube.com and youtu.be URLs
        if (urlObj.hostname.includes('youtu.be')) {
          return urlObj.pathname.slice(1); // Remove leading slash
        }
        return new URLSearchParams(urlObj.search).get('v') || 
               urlObj.pathname.split('/').filter(Boolean).pop() || null;
      case 'instagram':
        // Example: https://www.instagram.com/reel/ABC123/ or https://www.instagram.com/p/ABC123/
        const instaParts = urlObj.pathname.split('/').filter(Boolean);
        if (instaParts.includes('reel') || instaParts.includes('p')) {
          const idx = instaParts.indexOf('reel') !== -1 ? 
                      instaParts.indexOf('reel') : 
                      instaParts.indexOf('p');
          return idx + 1 < instaParts.length ? instaParts[idx + 1] : null;
        }
        return null;
      case 'tiktok':
        // Example: https://www.tiktok.com/@username/video/1234567890
        const tiktokParts = urlObj.pathname.split('/').filter(Boolean);
        const videoIdx = tiktokParts.indexOf('video');
        return videoIdx !== -1 && videoIdx + 1 < tiktokParts.length ? 
               tiktokParts[videoIdx + 1] : null;
      case 'facebook':
        // Example: https://www.facebook.com/watch/?v=1234567890
        return new URLSearchParams(urlObj.search).get('v') || 
               urlObj.pathname.split('/').filter(Boolean).pop() || null;
      case 'twitter':
        // Example: https://twitter.com/username/status/1234567890
        const twitterParts = urlObj.pathname.split('/').filter(Boolean);
        const statusIdx = twitterParts.indexOf('status');
        return statusIdx !== -1 && statusIdx + 1 < twitterParts.length ? 
               twitterParts[statusIdx + 1] : null;
      default:
        return null;
    }
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
}

// Function to detect platform from URL
export function detectPlatform(url: string): SocialPlatform | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('facebook') || hostname.includes('fb.watch')) return 'facebook';
    if (hostname.includes('tiktok')) return 'tiktok';
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'twitter';
    
    return null;
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
}

// Extract author from URL
export function extractAuthor(url: string, platform: SocialPlatform): string | null {
  try {
    const urlObj = new URL(url);
    
    switch(platform) {
      case 'tiktok':
        // Example: https://www.tiktok.com/@username/video/1234567890
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const atIndex = pathParts.findIndex(part => part.startsWith('@'));
        if (atIndex !== -1) {
          return pathParts[atIndex].substring(1); // Remove the @ symbol
        }
        return null;
      case 'instagram':
        // Example: https://www.instagram.com/username/reel/ABC123/
        const instaParts = urlObj.pathname.split('/').filter(Boolean);
        if (instaParts.length > 0 && !['reel', 'p', 'reels'].includes(instaParts[0])) {
          return instaParts[0]; // First part is usually the username
        }
        return null;
      case 'youtube':
        // For YouTube, we'd need to use the YouTube API to get channel info
        // This is a simplified placeholder
        return null;
      case 'facebook':
        // For Facebook, extract from URL if possible
        const fbParts = urlObj.pathname.split('/').filter(Boolean);
        if (fbParts.length > 0 && !['watch', 'video'].includes(fbParts[0])) {
          return fbParts[0];
        }
        return null;
      case 'twitter':
        // Example: https://twitter.com/username/status/1234567890
        const twitterParts = urlObj.pathname.split('/').filter(Boolean);
        if (twitterParts.length > 0) {
          return twitterParts[0];
        }
        return null;
      default:
        return null;
    }
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
}

// Generate a random color for tags
export function generateTagColor(): string {
  const colors = [
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-green-500/20 text-green-300 border-green-500/30',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'bg-red-500/20 text-red-300 border-red-500/30',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Local storage helpers
export function savePlaylistsToStorage(playlists: Playlist[]): void {
  localStorage.setItem('reelsmixer-playlists', JSON.stringify(playlists));
}

export function getPlaylistsFromStorage(): Playlist[] {
  const stored = localStorage.getItem('reelsmixer-playlists');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing playlists from storage:", e);
    return [];
  }
}

// Check if it's the first visit
export function isFirstVisit(): boolean {
  const visited = localStorage.getItem('reelsmixer-visited');
  if (!visited) {
    localStorage.setItem('reelsmixer-visited', 'true');
    return true;
  }
  return false;
}

// Mark as visited
export function markAsVisited(): void {
  localStorage.setItem('reelsmixer-visited', 'true');
}

// Copy to clipboard with fallback
export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch((error) => {
          console.error('Failed to copy with Clipboard API:', error);
          fallbackCopyToClipboard(text);
          resolve(true);
        });
    } else {
      fallbackCopyToClipboard(text);
      resolve(true);
    }
  });
}

// Fallback method for clipboard
function fallbackCopyToClipboard(text: string): void {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (!successful) {
      console.error('Fallback: Unable to copy');
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  
  document.body.removeChild(textArea);
}

// Validate URL format
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Get platform-specific embed parameters
export function getPlatformEmbedParams(platform: SocialPlatform): Record<string, any> {
  switch (platform) {
    case 'youtube':
      return {
        autoplay: 0,
        rel: 0,
        modestbranding: 1,
        controls: 1,
        showinfo: 0
      };
    case 'instagram':
      return {
        hidecaption: false,
        maxwidth: 540
      };
    case 'tiktok':
      return {
        blockId: 'tiktok-embed',
        hideCaption: false
      };
    case 'facebook':
      return {
        show_text: false,
        width: 560,
        autoplay: false
      };
    default:
      return {};
  }
}