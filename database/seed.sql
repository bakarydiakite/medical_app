-- =============================================================
-- Données de test — Application de rendez-vous médicaux
-- =============================================================
-- Exécuter avec : psql -U postgres -d medical_db -f seed.sql
-- OU via Docker  : docker exec -i medical_db psql -U postgres -d medical_db < database/seed.sql
-- =============================================================

-- Nettoyage (ordre inverse des dépendances)
TRUNCATE TABLE "Appointment" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Absence"     RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Doctor"      RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Specialty"   RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Center"      RESTART IDENTITY CASCADE;
TRUNCATE TABLE "User"        RESTART IDENTITY CASCADE;

-- =============================================================
-- 1. Centres médicaux
-- =============================================================
INSERT INTO "Center" (name, address, contact) VALUES
  ('Centre Médical République',  '10 Place de la République, 75010 Paris', '01 23 45 67 89'),
  ('Clinique du Parc',           '25 Avenue du Parc, 69006 Lyon',          '04 56 78 90 12');

-- =============================================================
-- 2. Spécialités médicales
-- =============================================================
INSERT INTO "Specialty" (name) VALUES
  ('Cardiologie'),
  ('Dermatologie'),
  ('Pédiatrie');

-- =============================================================
-- 3. Médecins
-- =============================================================
INSERT INTO "Doctor" (name, "isAvailable", "specialtyId", "centerId") VALUES
  ('Dr. Martin Dupont',   true, 1, 1),   -- Cardiologue, Paris
  ('Dr. Sophie Laurent',  true, 2, 1),   -- Dermatologue, Paris
  ('Dr. Pierre Bernard',  true, 1, 2),   -- Cardiologue, Lyon
  ('Dr. Marie Leclerc',   true, 3, 2);   -- Pédiatre, Lyon

-- =============================================================
-- 4. Comptes utilisateurs
-- Hash bcrypt (10 rounds) — les deux comptes utilisent : Admin123!
-- =============================================================
INSERT INTO "User" (name, email, password, role, "createdAt") VALUES
  (
    'Administrateur',
    'admin@medical.com',
    '$2b$10$uPlIZLRvEVMZ1nQ4AYRIyOXGxbDYlxseBk3IbD2aakLaNZdgqiL5K',
    'ADMIN',
    NOW()
  ),
  (
    'Jean Dupont',
    'patient@medical.com',
    '$2b$10$uPlIZLRvEVMZ1nQ4AYRIyOXGxbDYlxseBk3IbD2aakLaNZdgqiL5K',
    'PATIENT',
    NOW()
  );
