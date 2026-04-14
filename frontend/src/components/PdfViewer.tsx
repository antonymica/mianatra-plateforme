import { Download, ExternalLink, Maximize2 } from 'lucide-react';
import { useRef } from 'react';
import toast from 'react-hot-toast';

type PdfViewerProps = {
  title: string;
  url: string;
  downloadName: string;
  className?: string;
  viewerClassName?: string;
};

export function PdfViewer({ className = '', downloadName, title, url, viewerClassName = '' }: PdfViewerProps) {
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const handleFullscreen = async () => {
    try {
      await viewerRef.current?.requestFullscreen();
    } catch {
      toast.error("Le plein écran n'est pas disponible sur ce navigateur.");
    }
  };

  return (
    <section className={`overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 border-b border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-base-content">Lecture PDF</p>
          <p className="truncate text-xs text-base-content/60">{downloadName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline btn-sm" onClick={handleFullscreen} type="button">
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
            Plein écran
          </button>
          <a className="btn btn-ghost btn-sm" href={url} rel="noreferrer" target="_blank">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ouvrir
          </a>
          <a className="btn btn-primary btn-sm" download={downloadName} href={url}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Télécharger
          </a>
        </div>
      </div>
      <div ref={viewerRef} className={`h-[76vh] min-h-[32rem] bg-base-200 ${viewerClassName}`}>
        <iframe className="h-full w-full bg-base-100" src={url} title={`PDF ${title}`} />
      </div>
    </section>
  );
}
