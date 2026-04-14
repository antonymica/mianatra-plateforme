import { KeyRound, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';

import { FormField } from '../components/FormField';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { navigate } = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(username, password);
      toast.success('Connexion réussie.');
      navigate('/admin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[74vh] max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary text-primary-content">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Accès privé</p>
            <h1 className="mt-1 text-3xl font-black">Connexion administrateur</h1>
            <p className="mt-2 text-sm leading-6 text-base-content/65">
              Connectez-vous pour publier, modifier ou supprimer les cours PDF.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <FormField htmlFor="login-username" label="Nom d’utilisateur" required>
            <div className="input input-bordered flex h-12 w-full items-center gap-3">
              <UserRound className="h-5 w-5 text-base-content/45" aria-hidden="true" />
              <input
                autoComplete="username"
                className="w-full bg-transparent outline-none"
                id="login-username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                required
                type="text"
                value={username}
              />
            </div>
          </FormField>

          <FormField htmlFor="login-password" label="Mot de passe" required>
            <div className="input input-bordered flex h-12 w-full items-center gap-3">
              <KeyRound className="h-5 w-5 text-base-content/45" aria-hidden="true" />
              <input
                autoComplete="current-password"
                className="w-full bg-transparent outline-none"
                id="login-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Votre mot de passe"
                required
                type="password"
                value={password}
              />
            </div>
          </FormField>

          <button className="btn btn-primary h-12 w-full" disabled={submitting} type="submit">
            {submitting && <span className="loading loading-spinner loading-sm" />}
            Se connecter
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-200/80 p-6 sm:p-8">
        <ShieldCheck className="h-12 w-12 text-primary" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-black">Gestion sécurisée</h2>
        <div className="mt-5 grid gap-3 text-sm leading-6 text-base-content/70">
          <p className="rounded-lg border border-base-300 bg-base-100 p-4">
            Les routes d’administration demandent un token JWT valide.
          </p>
          <p className="rounded-lg border border-base-300 bg-base-100 p-4">
            Les mots de passe sont hashés avec bcrypt.
          </p>
          <p className="rounded-lg border border-base-300 bg-base-100 p-4">
            Les fichiers envoyés sont contrôlés avant stockage.
          </p>
        </div>
      </div>
    </section>
  );
}
