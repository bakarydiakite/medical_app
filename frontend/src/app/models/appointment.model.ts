// Statuts possibles d'un rendez-vous — miroir de l'enum backend
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

// Motifs possibles d'une absence — miroir de l'enum backend
export type AbsenceReason = 'SICKNESS' | 'VACATION' | 'OTHER'

// Structure d'un centre médical
export interface Center {
  id: number
  name: string
  address: string
  contact: string
}

// Structure d'une spécialité médicale
export interface Specialty {
  id: number
  name: string
}

// Structure d'une absence de médecin
export interface Absence {
  id: number
  startDate: string
  endDate: string
  reason: AbsenceReason
  doctorId: number
}

// Structure d'un médecin
export interface Doctor {
  id: number
  name: string
  isAvailable: boolean
  specialtyId: number
  centerId: number
  specialty: Specialty
  center: Center
  absences?: Absence[]
}

// Structure d'un rendez-vous complet
export interface Appointment {
  id: number
  dateTime: string
  status: AppointmentStatus
  createdAt: string
  doctorId: number
  userId: number
  doctor: Doctor
  user?: { id: number; name: string; email: string }
}

// Données envoyées pour créer un rendez-vous
export interface CreateAppointmentRequest {
  doctorId: number
  dateTime: string
}