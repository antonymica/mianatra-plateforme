import { BookOpen, Code2, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 font-black">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-content">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            Mianatra PDF Academy
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-base-content/65">
            Une bibliothèque de cours PDF claire, administrable et pensée pour une consultation rapide.
          </p>
        </div>
        <div>
          <h3 className="font-bold">Plateforme</h3>
          <p className="mt-3 text-sm leading-6 text-base-content/65">
            Cours publics, descriptions Markdown, fichiers protégés par validation PDF.
          </p>
        </div>
        <div>
          <h3 className="font-bold">Administration</h3>
          <div className="mt-3 space-y-2 text-sm text-base-content/65">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Authentification JWT
            </p>
            <p className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              Architecture frontend/backend
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
