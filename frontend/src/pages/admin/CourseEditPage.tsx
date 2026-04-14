import { FileText, Save, Type } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';

import { FormField } from '../../components/FormField';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { AppLink } from '../../components/AppLink';
import { useNavigation } from '../../hooks/useNavigation';
import { api } from '../../services/api';
import type { Course } from '../../types/course';

type CourseEditPageProps = {
  courseId: number;
};

export function CourseEditPage({ courseId }: CourseEditPageProps) {
  const { navigate } = useNavigation();
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .getCourse(courseId)
      .then((nextCourse) => {
        setCourse(nextCourse);
        setTitle(nextCourse.title);
        setDescription(nextCourse.description);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const updatedCourse = await api.updateCourse(courseId, { title, description, file });
      toast.success('Cours mis à jour.');
      navigate(`/courses/${updatedCourse.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mise à jour impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Chargement du cours" />;
  }

  if (!course) {
    return (
      <div className="rounded-lg border border-base-300 bg-base-100 p-10 text-center">
        <FileText className="mx-auto h-12 w-12 text-base-content/35" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black">Cours introuvable</h1>
        <AppLink className="btn btn-primary mt-6" to="/admin">
          Retour au tableau de bord
        </AppLink>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold text-primary">Édition</p>
        <h1 className="break-words text-3xl font-black">{course.title}</h1>
        <p className="mt-2 text-sm text-base-content/65">
          Modifiez le titre, la description Markdown ou remplacez le PDF si nécessaire.
        </p>
      </div>

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]" onSubmit={handleSubmit}>
        <section className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-black">Contenu du cours</h2>
          </div>

          <div className="mt-6 space-y-6">
            <FormField htmlFor="course-edit-title" label="Titre du cours" required>
              <div className="input input-bordered flex h-12 w-full items-center gap-3">
                <Type className="h-5 w-5 text-base-content/45" aria-hidden="true" />
                <input
                  className="w-full bg-transparent outline-none"
                  id="course-edit-title"
                  minLength={3}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  type="text"
                  value={title}
                />
              </div>
            </FormField>

            <FormField
              helper={`Fichier actuel : ${course.original_filename}`}
              htmlFor="course-edit-file"
              label="Remplacer le PDF"
            >
              <input
                accept="application/pdf,.pdf"
                className="file-input file-input-bordered h-12 w-full"
                id="course-edit-file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </FormField>

            <FormField
              helper="Cette description est affichée dans la fiche publique du cours."
              htmlFor="course-edit-description"
              label="Description Markdown"
              required
            >
              <textarea
                className="textarea textarea-bordered min-h-80 w-full font-mono text-sm leading-6"
                id="course-edit-description"
                onChange={(event) => setDescription(event.target.value)}
                required
                value={description}
              />
            </FormField>

            <button className="btn btn-primary h-12 w-full sm:w-auto" disabled={submitting} type="submit">
              {submitting && <span className="loading loading-spinner loading-sm" />}
              <Save className="h-4 w-4" aria-hidden="true" />
              Mettre à jour
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm xl:sticky xl:top-24 xl:self-start">
          <h2 className="text-xl font-black">Aperçu</h2>
          <div className="mt-5 max-h-[34rem] overflow-auto border-t border-base-300 pt-5">
            <MarkdownPreview content={description} />
          </div>
        </section>
      </form>
    </div>
  );
}
