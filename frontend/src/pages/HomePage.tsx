import { ArrowDownAZ, ArrowUpAZ, BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { CourseCard } from '../components/CourseCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../services/api';
import type { Course } from '../types/course';
import { stripMarkdown } from '../utils/format';

type SortMode = 'recent' | 'oldest';

const academyImage =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80';

export function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  useEffect(() => {
    api
      .getCourses()
      .then(setCourses)
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextCourses = courses.filter((course) => {
      if (!normalizedQuery) {
        return true;
      }

      return `${course.title} ${stripMarkdown(course.description)}`.toLowerCase().includes(normalizedQuery);
    });

    return nextCourses.sort((a, b) => {
      const first = new Date(a.created_at).getTime();
      const second = new Date(b.created_at).getTime();
      return sortMode === 'recent' ? second - first : first - second;
    });
  }, [courses, query, sortMode]);

  return (
    <div>
      <section className="border-b border-base-300 bg-base-200/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <div className="badge badge-primary badge-outline gap-2">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Catalogue de cours
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-4xl">
              Trouvez rapidement le PDF utile, puis ouvrez-le sans quitter la plateforme.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-base-content/70">
              Recherche instantanée, descriptions lisibles en Markdown, consultation intégrée et interface
              pensée pour les écrans mobiles comme desktop.
            </p>
            <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="input input-bordered flex h-12 items-center gap-3">
                <Search className="h-5 w-5 text-base-content/45" aria-hidden="true" />
                <input
                  className="grow"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher par titre ou description"
                  type="search"
                  value={query}
                />
              </label>
              <label className="select select-bordered flex h-12 items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-base-content/45" aria-hidden="true" />
                <select
                  aria-label="Trier les cours"
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  value={sortMode}
                >
                  <option value="recent">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                </select>
              </label>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
            <img
              alt="Espace de travail avec ordinateur portable et cahiers de cours"
              className="h-64 w-full object-cover"
              src={academyImage}
            />
            <div className="grid grid-cols-2 divide-x divide-base-300 border-t border-base-300">
              <div className="p-4">
                <p className="text-2xl font-black">{courses.length}</p>
                <p className="text-xs font-semibold text-base-content/60">cours publiés</p>
              </div>
              <div className="p-4">
                <p className="flex items-center gap-2 text-2xl font-black">
                  {sortMode === 'recent' ? (
                    <ArrowDownAZ className="h-5 w-5 text-primary" aria-hidden="true" />
                  ) : (
                    <ArrowUpAZ className="h-5 w-5 text-primary" aria-hidden="true" />
                  )}
                  PDF
                </p>
                <p className="text-xs font-semibold text-base-content/60">lecture intégrée</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-primary">{filteredCourses.length} résultat(s)</p>
            <h2 className="text-2xl font-black">Cours disponibles</h2>
          </div>
          {query && (
            <button className="btn btn-ghost btn-sm self-start" onClick={() => setQuery('')} type="button">
              Réinitialiser la recherche
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Chargement des cours" />
        ) : filteredCourses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-base-300 bg-base-200/60 p-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-base-content/35" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-black">Aucun cours trouvé</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-base-content/65">
              Ajustez votre recherche ou ajoutez un premier PDF depuis l’espace administrateur.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
