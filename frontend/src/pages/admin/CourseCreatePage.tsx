import { FilePlus2, FileText, Save, Type } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';

import { FormField } from '../../components/FormField';
import { MarkdownPreview } from '../../components/MarkdownPreview';
import { api } from '../../services/api';
import { useNavigation } from '../../hooks/useNavigation';

const starterDescription = `# Objectifs du cours

- Comprendre les notions principales
- Suivre les exemples du PDF
- Réviser avec une progression claire

> Ajoutez ici les prérequis, objectifs et ressources complémentaires.`;

export function CourseCreatePage() {
  const { navigate } = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(starterDescription);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      toast.error('Ajoutez un fichier PDF.');
      return;
    }

    setSubmitting(true);
    try {
      const course = await api.createCourse({ title, description, file });
      toast.success('Cours ajouté.');
      navigate(`/courses/${course.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Création impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold text-primary">Nouveau cours</p>
        <h1 className="text-3xl font-black">Publier un PDF</h1>
        <p className="mt-2 text-sm text-base-content/65">
          Renseignez le titre, rédigez la description en Markdown et joignez le fichier du cours.
        </p>
      </div>

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]" onSubmit={handleSubmit}>
        <section className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FilePlus2 className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-black">Informations</h2>
          </div>

          <div className="mt-6 space-y-6">
            <FormField htmlFor="course-title" label="Titre du cours" required>
              <div className="input input-bordered flex h-12 w-full items-center gap-3">
                <Type className="h-5 w-5 text-base-content/45" aria-hidden="true" />
                <input
                  className="w-full bg-transparent outline-none"
                  id="course-title"
                  minLength={3}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex : Introduction à Docker"
                  required
                  type="text"
                  value={title}
                />
              </div>
            </FormField>

            <FormField
              helper="Format accepté : PDF uniquement. La taille maximale est configurée côté API."
              htmlFor="course-file"
              label="Fichier PDF"
              required
            >
              <input
                accept="application/pdf,.pdf"
                className="file-input file-input-bordered h-12 w-full"
                id="course-file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
                type="file"
              />
            </FormField>

            <FormField
              helper="Utilisez des titres, listes et liens pour rendre la fiche du cours facile à lire."
              htmlFor="course-description"
              label="Description Markdown"
              required
            >
              <textarea
                className="textarea textarea-bordered min-h-80 w-full font-mono text-sm leading-6"
                id="course-description"
                onChange={(event) => setDescription(event.target.value)}
                required
                value={description}
              />
            </FormField>

            <button className="btn btn-primary h-12 w-full sm:w-auto" disabled={submitting} type="submit">
              {submitting && <span className="loading loading-spinner loading-sm" />}
              <Save className="h-4 w-4" aria-hidden="true" />
              Enregistrer
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm xl:sticky xl:top-24 xl:self-start">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-black">Aperçu</h2>
          </div>
          <div className="mt-5 max-h-[34rem] overflow-auto border-t border-base-300 pt-5">
            <MarkdownPreview content={description} />
          </div>
        </section>
      </form>
    </div>
  );
}
