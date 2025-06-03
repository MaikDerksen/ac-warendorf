interface YouTubeEmbedProps {
  embedId: string; // e.g., "dQw4w9WgXcQ"
  title?: string;
}

// TODO: Implement user consent for embedding YouTube videos
// For now, this component directly embeds the video.
// A proper implementation would require a consent banner/button.

export function YouTubeEmbed({ embedId, title = "YouTube video player" }: YouTubeEmbedProps) {
  return (
    <div className="aspect-video w-full max-w-3xl mx-auto my-6 rounded-lg overflow-hidden shadow-xl">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${embedId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}
