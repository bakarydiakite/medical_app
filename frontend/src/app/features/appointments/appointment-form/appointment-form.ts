import { Component, OnInit, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { NgClass } from '@angular/common'
import { CenterService } from '../../../core/services/center.service'
import { SpecialtyService } from '../../../core/services/specialty.service'
import { DoctorService, TimeSlot } from '../../../core/services/doctor.service'
import { AppointmentService } from '../../../core/services/appointment.service'
import { Center, Specialty, Doctor } from '../../../models/appointment.model'

/**
 * Formulaire de prise de rendez-vous en 4 étapes :
 *   1. Choisir un centre et une spécialité
 *   2. Choisir un médecin disponible
 *   3. Choisir une date et un créneau horaire
 *   4. Confirmer et soumettre
 *
 * L'état de navigation est géré par un Signal `step` pour éviter
 * toute logique de routing imbriqué.
 */
@Component({
  selector: 'app-appointment-form',
  imports: [FormsModule, RouterLink, NgClass],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.css',
})
export class AppointmentFormComponent implements OnInit {

  // ── État de navigation ────────────────────────────────────────────────
  step = signal(1)

  // ── Données chargées depuis l'API ─────────────────────────────────────
  centers     = signal<Center[]>([])
  specialties = signal<Specialty[]>([])
  doctors     = signal<Doctor[]>([])
  slots       = signal<TimeSlot[]>([])

  // ── Sélections de l'utilisateur ───────────────────────────────────────
  selectedCenterId    = signal<number | null>(null)
  selectedSpecialtyId = signal<number | null>(null)
  selectedDoctor      = signal<Doctor | null>(null)
  selectedDate        = signal('')
  selectedSlot        = signal<TimeSlot | null>(null)

  // ── États UI ──────────────────────────────────────────────────────────
  isLoading    = signal(false)
  slotsLoading = signal(false)
  errorMessage = signal('')
  noSlots      = signal(false)

  // La date minimale est demain pour empêcher les RDV rétroactifs
  minDate: string

  constructor(
    private centerService: CenterService,
    private specialtyService: SpecialtyService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private router: Router,
  ) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    this.minDate = tomorrow.toISOString().split('T')[0]
  }

  ngOnInit(): void {
    this.loadCenters()
    this.loadSpecialties()
  }

  // ── Chargements initiaux 

  loadCenters(): void {
    this.centerService.getAll().subscribe({
      next: (data) => this.centers.set(data),
      error: () => this.errorMessage.set('Impossible de charger les centres'),
    })
  }

  loadSpecialties(): void {
    this.specialtyService.getAll().subscribe({
      next: (data) => this.specialties.set(data),
    })
  }

  // ── Navigation entre étapes ───────────────────────────────────────────

  goToStep2(): void {
    if (!this.selectedCenterId() || !this.selectedSpecialtyId()) return
    this.loadDoctors()
    this.step.set(2)
  }

  goToStep3(doctor: Doctor): void {
    this.selectedDoctor.set(doctor)
    this.step.set(3)
  }

  goToStep4(): void {
    if (!this.selectedDate() || !this.selectedSlot()) return
    this.step.set(4)
  }

  goBack(): void {
    this.errorMessage.set('')
    if (this.step() > 1) this.step.update(s => s - 1)
  }

  // ── Chargements conditionnels ─────────────────────────────────────────

  loadDoctors(): void {
    this.isLoading.set(true)
    this.doctors.set([])

    this.doctorService.getAll(this.selectedCenterId()!, this.selectedSpecialtyId()!).subscribe({
      next:  (data) => { this.doctors.set(data); this.isLoading.set(false) },
      error: () => { this.errorMessage.set('Impossible de charger les médecins'); this.isLoading.set(false) },
    })
  }

  loadSlots(): void {
    const doctor = this.selectedDoctor()
    const date   = this.selectedDate()
    if (!doctor || !date) return

    this.slotsLoading.set(true)
    this.noSlots.set(false)
    this.slots.set([])
    this.selectedSlot.set(null)

    this.doctorService.getAvailableSlots(doctor.id, date).subscribe({
      next: (res) => {
        if (!res.available) {
          this.noSlots.set(true)
          this.slotsLoading.set(false)
          return
        }
        const available = res.slots.filter(s => s.available)
        this.slots.set(available)
        this.noSlots.set(available.length === 0)
        this.slotsLoading.set(false)
      },
      error: () => { this.errorMessage.set('Impossible de charger les créneaux'); this.slotsLoading.set(false) },
    })
  }

  onDateChange(): void {
    this.slots.set([])
    this.selectedSlot.set(null)
    this.noSlots.set(false)
    if (this.selectedDate()) this.loadSlots()
  }

  selectSlot(slot: TimeSlot): void {
    this.selectedSlot.set(slot)
  }

  // ── Soumission ────────────────────────────────────────────────────────

  confirm(): void {
    const slot   = this.selectedSlot()
    const doctor = this.selectedDoctor()
    if (!slot || !doctor) return

    this.isLoading.set(true)
    this.errorMessage.set('')

    this.appointmentService.create({ doctorId: doctor.id, dateTime: slot.dateTime }).subscribe({
      next:  () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Une erreur est survenue')
        this.isLoading.set(false)
      },
    })
  }

  // ── Helpers pour le template ──────────────────────────────────────────

  doctorInitial(name: string): string {
    const parts = name.trim().split(' ')
    return (parts[parts.length - 1]?.charAt(0) ?? '?').toUpperCase()
  }

  centerName(): string {
    return this.centers().find(c => c.id === this.selectedCenterId())?.name ?? ''
  }

  specialtyName(): string {
    return this.specialties().find(s => s.id === this.selectedSpecialtyId())?.name ?? ''
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }
}
