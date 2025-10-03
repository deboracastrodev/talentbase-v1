import { cn } from '../lib/utils';

export interface VideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function VideoPlayer({ url, title = 'Vídeo de Apresentação', className }: VideoPlayerProps) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return <div className="text-red-500">URL de vídeo inválida</div>;
  }

  return (
    <div className={cn('w-full', className)}>
      <iframe
        src={`https://youtube.com/embed/${videoId}`}
        title={title}
        className="aspect-video w-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
