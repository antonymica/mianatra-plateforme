import { CalendarDays, ChevronLeft, ChevronUp, FileText, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { PdfViewer } from '../components/PdfViewer';
import { AppLink } from '../components/AppLink';
import { api, getFileUrl } from '../services/api';
import type { Course } from '../types/course';
import { formatDateTime, formatFileSize } from '../utils/format';

type CourseDetailsPageProps = {
  courseId: number;
};

export function CourseDetailsPage({ courseId }: CourseDetailsPageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  useEffect(() => {
    api
      .getCourse(courseId)
      .then(setCourse)
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <LoadingSpinner label="Ouverture du cours" />;
  }

  if (!course) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <FileText className="mx-auto h-12 w-12 text-base-content/35" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black">Cours introuvable</h1>
        <AppLink className="btn btn-primary mt-6" to="/">
          Revenir au catalogue
        </AppLink>
      </section>
    );
  }

  const pdfUrl = getFileUrl(course.pdf_url);

  return (
    <div className="mx-auto max-w-[96rem] px-4 py-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <AppLink className="btn btn-ghost btn-sm mb-4 px-0 hover:bg-transparent" to="/">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Retour au catalogue
          </AppLink>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-primary badge-outline gap-2">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {formatFileSize(course.file_size)}
            </span>
            <span className="badge badge-ghost gap-2">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDateTime(course.created_at)}
            </span>
          </div>
          <h1 className="mt-3 break-words text-2xl font-black leading-tight sm:text-3xl">{course.title}</h1>
        </div>
        <button
          className="btn btn-outline self-start lg:self-auto"
          onClick={() => setDescriptionOpen((current) => !current)}
          type="button"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          {descriptionOpen ? 'Masquer la fiche' : 'Afficher la fiche'}
        </button>
      </div>

      <div className={`grid gap-5 ${descriptionOpen ? 'xl:grid-cols-[24rem_minmax(0,1fr)]' : ''}`}>
        {descriptionOpen && (
          <aside className="rounded-lg border border-base-300 bg-base-100 shadow-sm xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-auto">
            <div className="flex items-center justify-between border-b border-base-300 p-4">
              <div>
                <p className="text-sm font-black">Fiche du cours</p>
                <p className="text-xs text-base-content/55">Description et objectifs</p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDescriptionOpen(false)}
                type="button"
              >
                <ChevronUp className="h-4 w-4 rotate-90" aria-hidden="true" />
              </button>
            </div>
            <div className="p-5">
              <MarkdownPreview content={course.description} />
            </div>
          </aside>
        )}

        <PdfViewer
          downloadName={course.original_filename}
          title={course.title}
          url={pdfUrl}
          viewerClassName="xl:h-[calc(100vh-12rem)]"
        />
      </div>
    </div>
  );
}
