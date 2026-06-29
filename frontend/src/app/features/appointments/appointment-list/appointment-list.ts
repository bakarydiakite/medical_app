import { Component, OnInit, signal, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { DatePipe, NgClass } from '@angular/common'
import { AuthService } from '../../../core/services/auth.service'
import { AppointmentService } from '../../../core/services/appointment.service'
import { Appointment, AppointmentStatus } from '../../../models/appointment.model'

@Component({
  selector: 'app-appointment-list',
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css',
})
export class AppointmentListComponent implements OnInit {
  private authService        = inject(AuthService)
  private appointmentService = inject(AppointmentService)

  appointments = signal<Appointment[]>([])
  isLoading    = signal(true)
  errorMessage = signal('')
  cancellingId = signal<number | null>(null)

  // Getter requis : un champ de classe initialisé avec inject() ne peut pas
  // être référencé par un autre champ de classe au moment de l'initialisation
  get currentUser() { return this.authService.currentUser }

  ngOnInit(): void {
    this.loadAppointments()
  }

  loadAppointments(): void {
    this.isLoading.set(true)
    this.errorMessage.set('')

    this.appointmentService.getMyAppointments().subscribe({
      next:  (data) => { this.appointments.set(data); this.isLoading.set(false) },
      error: () => { this.errorMessage.set('Impossible de charger les rendez-vous'); this.isLoading.set(false) },
    })
  }

  cancelAppointment(id: number): void {
    this.cancellingId.set(id)

    this.appointmentService.cancel(id).subscribe({
      next:  () => { this.cancellingId.set(null); this.loadAppointments() },
      error: () => { this.cancellingId.set(null); this.errorMessage.set("Erreur lors de l'annulation") },
    })
  }

  logout(): void {
    this.authService.logout()
  }

  // ── Computed ──────────────────────────────────────────────────────────

  get pendingCount():   number { return this.appointments().filter(a => a.status === 'PENDING').length }
  get confirmedCount(): number { return this.appointments().filter(a => a.status === 'CONFIRMED').length }
  get cancelledCount(): number { return this.appointments().filter(a => a.status === 'CANCELLED').length }

  /** Retourne l'initiale du nom de famille du médecin pour l'avatar. */
  doctorInitial(name: string): string {
    const parts = name.trim().split(' ')
    return (parts[parts.length - 1]?.charAt(0) ?? '?').toUpperCase()
  }

  statusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé',
    }
    return labels[status]
  }

  statusClass(status: AppointmentStatus): string {
    const classes: Record<AppointmentStatus, string> = {
      PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled',
    }
    return classes[status]
  }
}
