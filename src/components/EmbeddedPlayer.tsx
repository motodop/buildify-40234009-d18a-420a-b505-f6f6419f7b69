import React, { useState, useEffect } from 'react';
import { ReelItem } from '@/lib/utils';
import { Play, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface EmbeddedPlayerProps {
  reel: ReelItem;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
}

const EmbeddedPlayer: React.FC<EmbeddedPlayerProps> = ({ reel, isPlaying, onPlayStateChange }) => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    generateEmbedUrl();
  }, [reel]);

  const generateEmbedUrl = () => {
    setError(null);
    setShowFallback(false);
    
    try {
      let url: string | null = null;
      
      switch (reel.platform) {
        case 'youtube':
          if (reel.videoId) {
            url = `https://www.youtube.com/embed/${reel.videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1`;
          }
          break;
          
        case 'instagram':
          if (reel.videoId) {
            // Instagram embed URL format
            url = `https://www.instagram.com/p/${reel.videoId}/embed/`;
          }
          break;
          
        case 'tiktok':
          if (reel.videoId) {
            // TikTok embed URL format
            url = `https://www.tiktok.com/embed/v2/${reel.videoId}`;
          }
          break;
          
        case 'facebook':
          if (reel.videoId) {
            // Facebook video embed
            url = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(reel.url)}&show_text=false&width=560`;
          }
          break;
          
        case 'twitter':
          // Twitter doesn't support direct video embeds, show fallback
          setShowFallback(true);
          break;
          
        default:
          setError('Unsupported platform');
          return;
      }
      
      setEmbedUrl(url);
    } catch (err) {
      setError('Failed to generate embed URL');
      console.error('Embed URL generation error:', err);
    }
  };

  const handleIframeError = () => {
    setError('Failed to load embedded content');
    setShowFallback(true);
  };

  const openInNewTab = () => {
    window.open(reel.url, '_blank', 'noopener,noreferrer');
  };

  if (error && !showFallback) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 rounded-lg border border-border/50">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4 text-center px-4">{error}</p>
        <Button onClick={openInNewTab} variant="outline" className="rounded-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Original
        </Button>
      </div>
    );
  }

  if (showFallback || !embedUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 rounded-lg border border-border/50">
        <div className="text-center p-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="font-semibold mb-2">{reel.title || reel.author}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {reel.platform === 'twitter' 
              ? 'Twitter videos require viewing on the original platform'
              : 'Embedded player not available for this content'
            }
          </p>
          <Button onClick={openInNewTab} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on {reel.platform.charAt(0).toUpperCase() + reel.platform.slice(1)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border/50">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={handleIframeError}
        onLoad={() => setError(null)}
        title={`${reel.platform} video player`}
      />
    </div>
  );
};

export default EmbeddedPlayer;