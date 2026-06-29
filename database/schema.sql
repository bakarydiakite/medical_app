
-- Schéma de la base de données — Application MedRDV

docker exec -i medical_db psql "postgresql://medical_app_db_h5p4_user:mjQ5SE52Yjf2Z67kuw8dz3bAkebkkgWi@dpg-d91be18k1i2s738d83q0-a.oregon-postgres.render.com/medical_app_db_h5p4" < "G:\medical-app\database\seed.sql"



-- Enums
CREATE TYPE "Role" AS ENUM ('PATIENT', 'ADMIN');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "AbsenceReason" AS ENUM ('SICKNESS', 'VACATION', 'OTHER');

-- Table des utilisateurs
CREATE TABLE "User" (
  "id"        SERIAL PRIMARY KEY,
  "name"      VARCHAR(255)  NOT NULL,
  "email"     VARCHAR(255)  NOT NULL UNIQUE,
  "password"  VARCHAR(255)  NOT NULL,
  "role"      "Role"        NOT NULL DEFAULT 'PATIENT',
  "createdAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Table des centres médicaux
CREATE TABLE "Center" (
  "id"      SERIAL PRIMARY KEY,
  "name"    VARCHAR(255) NOT NULL,
  "address" VARCHAR(255) NOT NULL,
  "contact" VARCHAR(100) NOT NULL
);

-- Table des spécialités médicales
CREATE TABLE "Specialty" (
  "id"   SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL UNIQUE
);

-- Table des médecins
CREATE TABLE "Doctor" (
  "id"          SERIAL       PRIMARY KEY,
  "name"        VARCHAR(255) NOT NULL,
  "isAvailable" BOOLEAN      NOT NULL DEFAULT TRUE,
  "specialtyId" INTEGER      NOT NULL REFERENCES "Specialty"("id") ON DELETE RESTRICT,
  "centerId"    INTEGER      NOT NULL REFERENCES "Center"("id")    ON DELETE RESTRICT
);

-- Table des absences des médecins
CREATE TABLE "Absence" (
  "id"        SERIAL          PRIMARY KEY,
  "startDate" TIMESTAMPTZ     NOT NULL,
  "endDate"   TIMESTAMPTZ     NOT NULL,
  "reason"    "AbsenceReason" NOT NULL,
  "doctorId"  INTEGER         NOT NULL REFERENCES "Doctor"("id") ON DELETE CASCADE,
  CONSTRAINT chk_absence_dates CHECK ("endDate" > "startDate")
);

-- Table des rendez-vous
CREATE TABLE "Appointment" (
  "id"        SERIAL              PRIMARY KEY,
  "dateTime"  TIMESTAMPTZ         NOT NULL,
  "status"    "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "userId"    INTEGER             NOT NULL REFERENCES "User"("id")   ON DELETE RESTRICT,
  "doctorId"  INTEGER             NOT NULL REFERENCES "Doctor"("id") ON DELETE RESTRICT
);

-- Index utiles pour les performances
CREATE INDEX idx_appointment_doctor   ON "Appointment"("doctorId");
CREATE INDEX idx_appointment_user     ON "Appointment"("userId");
CREATE INDEX idx_appointment_datetime ON "Appointment"("dateTime");
CREATE INDEX idx_absence_doctor       ON "Absence"("doctorId");
CREATE INDEX idx_doctor_specialty     ON "Doctor"("specialtyId");
CREATE INDEX idx_doctor_center        ON "Doctor"("centerId");
