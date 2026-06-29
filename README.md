# MedRDV — Application de prise de rendez-vous médical

Application fullstack permettant la gestion et la prise de rendez-vous médicaux en ligne.

## Démo en ligne

| Service | URL |
|---|---|
| **Frontend** | https://medical-app-rust.vercel.app |
| **Backend API** | https://medical-app-hcjj.onrender.com/api |

---

## Choix techniques

| Couche | Technologie | Justification |
|---|---|---|
| Backend | NestJS (Node.js) + TypeScript | Architecture modulaire, injection de dépendances, validation intégrée |
| ORM | Prisma | Type-safety, migrations automatiques, requêtes lisibles |
| Base de données | PostgreSQL 15 (Docker) | Robustesse, support des types énumérés |
| Authentification | JWT (JSON Web Tokens) | Stateless, standard REST |
| Frontend | Angular 21 (Standalone Components) | Composants autonomes, Signals pour la réactivité |
| Styles | CSS pur | Sans dépendance externe, contrôle total |

---

## Architecture du projet

```
medical-app/
├── backend/          # API REST — NestJS
│   ├── src/
│   │   ├── auth/         # Authentification JWT
│   │   ├── centers/      # Gestion des centres
│   │   ├── specialties/  # Gestion des spécialités
│   │   ├── doctors/      # Gestion des médecins + absences
│   │   ├── appointments/ # Gestion des rendez-vous
│   │   └── prisma/       # Client base de données
│   └── prisma/
│       └── schema.prisma # Schéma de données
├── frontend/         # Application Angular
│   └── src/app/
│       ├── core/         # Services, guards, intercepteurs
│       ├── features/     # Composants par domaine
│       └── models/       # Types TypeScript
├── database/
│   ├── schema.sql    # Script de création des tables
│   └── seed.sql      # Données d'exemple
└── docker-compose.yml
```

---

## Prérequis

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) et Docker Compose
- npm v9+

---

## Installation et exécution locale

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd medical-app
```

### 2. Démarrer la base de données

```bash
docker-compose up -d
```

### 3. Configurer le backend

```bash
cd backend
npm install
```

Le fichier `.env` est déjà présent avec la configuration par défaut :
```
DATABASE_URL="postgresql://postgres:Fantabaki61@localhost:5432/medical_db"
JWT_SECRET="medical_app_jwt_secret_super_long_2026"
```

### 4. Créer les tables et charger les données

```bash
# Appliquer les migrations Prisma (crée toutes les tables)
npx prisma db push

# Charger les données d'exemple
docker exec -i medical_db psql -U postgres -d medical_db < ../database/seed.sql
```

### 5. Démarrer le backend

```bash
npm run start:dev
# API disponible sur http://localhost:3001/api
```

### 6. Démarrer le frontend

```bash
cd ../frontend
npm install
npm start
# Application disponible sur http://localhost:4200
```

---

## Utilisateurs de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@medical.com`    | `Admin123!` |
| Patient        | `patient@medical.com`  | `Admin123!` |

---

## Endpoints API principaux

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Inscription |
| POST | `/api/auth/login` | Public | Connexion |
| GET | `/api/centers` | Public | Liste des centres |
| GET | `/api/specialties` | Public | Liste des spécialités |
| GET | `/api/doctors?centerId=&specialtyId=` | Public | Médecins filtrés |
| GET | `/api/doctors/:id/available-slots?date=` | Public | Créneaux disponibles |
| GET | `/api/appointments` | Authentifié | Mes rendez-vous |
| POST | `/api/appointments` | Patient | Créer un RDV |
| PATCH | `/api/appointments/:id/cancel` | Authentifié | Annuler un RDV |
| PATCH | `/api/appointments/:id/confirm` | Admin | Confirmer un RDV |
| POST | `/api/centers` | Admin | Créer un centre |
| PUT | `/api/centers/:id` | Admin | Modifier un centre |
| DELETE | `/api/centers/:id` | Admin | Supprimer un centre |
| POST | `/api/doctors` | Admin | Créer un médecin |
| POST | `/api/doctors/:id/absences` | Admin | Déclarer une absence |
| DELETE | `/api/doctors/:id/absences/:id` | Admin | Supprimer une absence |

---

## Règles métier

- Un créneau est indisponible si le médecin est absent ce jour-là (absences vérifiées côté backend)
- Un créneau est indisponible s'il est déjà réservé par un autre patient (statut ≠ ANNULÉ)
- Les créneaux disponibles sont générés de 9h à 17h30 par tranches de 30 min (pause 12h–14h)
- Un patient ne peut voir et modifier que ses propres rendez-vous
- Seul un admin peut confirmer un rendez-vous ou gérer le catalogue (centres, médecins, spécialités)

---

## Données d'exemple incluses

- 2 centres médicaux (Paris, Lyon)
- 3 spécialités (Cardiologie, Dermatologie, Pédiatrie)
- 4 médecins répartis dans les centres
- 1 compte administrateur
