import { CalendarDays, FileText } from 'lucide-react';

import { AppLink } from './AppLink';
import type { Course } from '../types/course';
import { formatDate, formatFileSize, stripMarkdown } from '../utils/format';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="card h-full border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="badge badge-outline">{formatFileSize(course.file_size)}</span>
        </div>
        <h2 className="card-title mt-3 break-words text-xl">{course.title}</h2>
        <p className="line-clamp-3 text-sm leading-6 text-base-content/70">
          {stripMarkdown(course.description)}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-base-content/60">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Ajouté le {formatDate(course.created_at)}
        </div>
        <div className="card-actions mt-5">
          <AppLink className="btn btn-primary btn-block" to={`/courses/${course.id}`}>
            Consulter le cours
          </AppLink>
        </div>
      </div>
    </article>
  );
}
