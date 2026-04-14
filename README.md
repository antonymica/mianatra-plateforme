# Mianatra PDF Academy

Plateforme web moderne pour publier, administrer et consulter des cours PDF. Le projet est séparé en deux applications : un frontend React TypeScript avec Vite, TailwindCSS, DaisyUI et Lucide React, puis une API FastAPI connectée à PostgreSQL.

## Stack

- Frontend : React, TypeScript, Vite, TailwindCSS, DaisyUI, Lucide React, react-hot-toast.
- Backend : FastAPI, SQLAlchemy, Pydantic, JWT, bcrypt.
- Base de données : PostgreSQL 16 alpine.
- Stockage PDF : dossier `backend/app/uploads`, montable en volume Docker.

## Structure

```txt
frontend/
  src/
    components/
    hooks/
    layouts/
    pages/
    routes/
    services/
    styles/
    types/
backend/
  app/
    core/
    database/
    models/
    routers/
    schemas/
    services/
    uploads/
docker-compose.yml
init.sql
.env.example
```

## Lancement avec Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Services :

- Frontend : `http://localhost:3000`
- Backend : `http://localhost:8000`
- Documentation API : `http://localhost:8000/docs`
- PostgreSQL : `localhost:5432`

Identifiants admin par défaut :

- Utilisateur : `admin`
- Mot de passe : `admin123`

Changez `DEFAULT_ADMIN_PASSWORD` et `SECRET_KEY` dans `.env` avant un usage réel.

## Lancement en développement local

### Base PostgreSQL

Vous pouvez lancer seulement PostgreSQL avec Docker :

```bash
docker compose up db
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/pdf_courses"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Au démarrage, l’API crée les tables si besoin et ajoute automatiquement un administrateur si aucun compte admin n’existe.

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev -- --host 0.0.0.0 --port 3000
```

## Endpoints API

- `POST /api/auth/login` : connexion admin, retourne un token JWT.
- `GET /api/auth/me` : profil de l’admin connecté.
- `GET /api/courses` : liste publique des cours.
- `GET /api/courses/{id}` : détail public d’un cours.
- `POST /api/courses` : création d’un cours avec upload PDF, protégé.
- `PUT /api/courses/{id}` : modification titre, description et PDF optionnel, protégé.
- `DELETE /api/courses/{id}` : suppression du cours et du fichier physique, protégé.
- `GET /api/uploads/{filename}` : consultation du PDF.
- `GET /api/admin/stats` : statistiques admin, protégé.

## Sécurité

- Les mots de passe sont hashés avec bcrypt.
- Les routes admin côté API exigent un token JWT.
- Le frontend protège l’accès aux pages admin et purge les sessions invalides.
- L’upload vérifie l’extension `.pdf`, le type MIME et la taille maximale configurable.
- Les noms de fichiers sont nettoyés et stockés avec un identifiant unique.
- Les secrets sont lus depuis les variables d’environnement.

## Notes

Le fichier `init.sql` prépare les tables lors de la première initialisation du volume PostgreSQL. La logique Python `init_database()` reste la source de vérité au démarrage de l’API et crée l’admin par défaut avec les variables d’environnement.
