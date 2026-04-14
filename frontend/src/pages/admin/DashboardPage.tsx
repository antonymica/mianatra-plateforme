import {
  CalendarClock,
  Edit3,
  Eye,
  FilePlus2,
  FileText,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { ConfirmModal } from '../../components/ConfirmModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AppLink } from '../../components/AppLink';
import { api } from '../../services/api';
import type { AdminStats, Course } from '../../types/course';
import { formatDate, formatFileSize } from '../../utils/format';

export function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const latestTitle = useMemo(() => stats?.latest_course?.title ?? 'Aucun cours', [stats]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCourses, nextStats] = await Promise.all([api.getCourses(), api.getStats()]);
      setCourses(nextCourses);
      setStats(nextStats);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleDelete = async () => {
    if (!courseToDelete) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteCourse(courseToDelete.id);
      toast.success('Cours supprimé.');
      setCourseToDelete(null);
      await loadDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Chargement du dashboard" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-primary">Administration</p>
          <h1 className="text-3xl font-black">Tableau de bord des cours</h1>
          <p className="mt-2 text-sm text-base-content/65">
            Pilotez les PDF publiés, suivez les volumes et gardez le catalogue propre.
          </p>
        </div>
        <AppLink className="btn btn-primary" to="/admin/courses/new">
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          Ajouter un cours
        </AppLink>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-base-content/60">Total cours</p>
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-4xl font-black">{stats?.total_courses ?? 0}</p>
          </div>
        </div>
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-base-content/60">Fichiers PDF</p>
              <HardDrive className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-4xl font-black">{stats?.total_pdf_files ?? 0}</p>
            <p className="text-xs text-base-content/60">
              {formatFileSize(stats?.total_storage_bytes ?? 0)} stockés
            </p>
          </div>
        </div>
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-base-content/60">Dernier ajout</p>
              <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <p className="line-clamp-3 text-xl font-black">{latestTitle}</p>
            {stats?.latest_course && (
              <p className="text-xs text-base-content/60">{formatDate(stats.latest_course.created_at)}</p>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Liste des cours</h2>
            <p className="text-sm text-base-content/60">Actions rapides de consultation, édition et suppression.</p>
          </div>
          <span className="badge badge-outline">{courses.length} ligne(s)</span>
        </div>

        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Fichier</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="max-w-md">
                        <p className="break-words font-bold">{course.title}</p>
                        <p className="text-xs text-base-content/55">{formatFileSize(course.file_size)}</p>
                      </div>
                    </td>
                    <td className="max-w-xs break-words text-sm text-base-content/65">
                      {course.original_filename}
                    </td>
                    <td className="text-sm">{formatDate(course.created_at)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <AppLink className="btn btn-ghost btn-sm" title="Voir" to={`/courses/${course.id}`}>
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </AppLink>
                        <AppLink
                          className="btn btn-ghost btn-sm"
                          title="Modifier"
                          to={`/admin/courses/${course.id}/edit`}
                        >
                          <Edit3 className="h-4 w-4" aria-hidden="true" />
                        </AppLink>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => setCourseToDelete(course)}
                          title="Supprimer"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-base-content/35" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-black">Aucun cours publié</h3>
            <p className="mt-2 text-sm text-base-content/65">Ajoutez un premier fichier PDF pour lancer le catalogue.</p>
          </div>
        )}
      </section>

      <ConfirmModal
        confirmLabel="Supprimer"
        description={`Le cours "${courseToDelete?.title ?? ''}" et son fichier PDF seront supprimés définitivement.`}
        loading={deleting}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={handleDelete}
        open={Boolean(courseToDelete)}
        title="Supprimer ce cours ?"
      />
    </div>
  );
}
