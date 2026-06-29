import { Component, OnInit, signal, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgClass, DatePipe } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { AuthService } from '../../../core/services/auth.service'
import {
  Center, Specialty, Doctor, Appointment, AbsenceReason
} from '../../../models/appointment.model'
import { environment } from '../../../../environments/environment'

type Tab = 'appointments' | 'doctors' | 'centers' | 'specialties'

const API = environment.apiUrl

/**
 * Tableau de bord administrateur — interface unifiée pour gérer l'ensemble
 * du catalogue médical et superviser les rendez-vous.
 *
 * HttpClient est utilisé directement (sans service wrapper) car les appels
 * sont propres à cette vue et ne sont pas réutilisés ailleurs.
 */
@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService)
  private http        = inject(HttpClient)

  get currentUser() { return this.authService.currentUser }

  activeTab = signal<Tab>('appointments')

  // ── État par section ──────────────────────────────────────────────────

  appointments = signal<Appointment[]>([])
  aptsLoading  = signal(false)
  actioningId  = signal<number | null>(null)

  centers       = signal<Center[]>([])
  showCenterForm = signal(false)
  editingCenter  = signal<Center | null>(null)
  centerForm     = { name: '', address: '', contact: '' }

  specialties  = signal<Specialty[]>([])
  showSpecForm = signal(false)
  newSpecName  = ''

  doctors            = signal<Doctor[]>([])
  docsLoading        = signal(false)
  showDoctorForm     = signal(false)
  editingDoctor      = signal<Doctor | null>(null)
  doctorForm         = { name: '', specialtyId: 0, centerId: 0, isAvailable: true }
  showAbsenceFormFor = signal<number | null>(null)
  absenceForm        = { startDate: '', endDate: '', reason: 'SICKNESS' as AbsenceReason }

  absenceReasons: { value: AbsenceReason; label: string }[] = [
    { value: 'SICKNESS', label: 'Maladie' },
    { value: 'VACATION', label: 'Congés' },
    { value: 'OTHER',    label: 'Autre' },
  ]

  errorMsg   = signal('')
  successMsg = signal('')

  ngOnInit() {
    this.loadTab('appointments')
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab)
    this.errorMsg.set('')
    this.successMsg.set('')
    this.closeAllForms()
    this.loadTab(tab)
  }

  logout() { this.authService.logout() }

  // ── Helpers privés ────────────────────────────────────────────────────

  private loadTab(tab: Tab) {
    if (tab === 'appointments') this.loadAppointments()
    if (tab === 'centers')      this.loadCenters()
    if (tab === 'specialties')  this.loadSpecialties()
    if (tab === 'doctors') {
      this.loadDoctors()
      this.loadCenters()
      this.loadSpecialties()
    }
  }

  private closeAllForms() {
    this.showCenterForm.set(false)
    this.showSpecForm.set(false)
    this.showDoctorForm.set(false)
    this.showAbsenceFormFor.set(null)
  }

  private ok(msg: string) {
    this.successMsg.set(msg)
    this.errorMsg.set('')
    setTimeout(() => this.successMsg.set(''), 3000)
  }

  private ko(err: any) {
    this.errorMsg.set(err?.error?.message ?? 'Une erreur est survenue')
  }

  // ── Rendez-vous ───────────────────────────────────────────────────────

  loadAppointments() {
    this.aptsLoading.set(true)
    this.http.get<Appointment[]>(`${API}/appointments`).subscribe({
      next:  (d) => { this.appointments.set(d); this.aptsLoading.set(false) },
      error: ()  => this.aptsLoading.set(false),
    })
  }

  confirmAppt(id: number) {
    this.actioningId.set(id)
    this.http.patch(`${API}/appointments/${id}/confirm`, {}).subscribe({
      next:  () => { this.actioningId.set(null); this.ok('RDV confirmé'); this.loadAppointments() },
      error: (e) => { this.actioningId.set(null); this.ko(e) },
    })
  }

  cancelAppt(id: number) {
    this.actioningId.set(id)
    this.http.patch(`${API}/appointments/${id}/cancel`, {}).subscribe({
      next:  () => { this.actioningId.set(null); this.ok('RDV annulé'); this.loadAppointments() },
      error: (e) => { this.actioningId.set(null); this.ko(e) },
    })
  }

  // ── Centres ───────────────────────────────────────────────────────────

  loadCenters() {
    this.http.get<Center[]>(`${API}/centers`).subscribe({
      next: (d) => this.centers.set(d),
    })
  }

  openCenterForm(center?: Center) {
    this.editingCenter.set(center ?? null)
    this.centerForm = center
      ? { name: center.name, address: center.address, contact: center.contact }
      : { name: '', address: '', contact: '' }
    this.showCenterForm.set(true)
  }

  saveCenter() {
    const editing = this.editingCenter()
    const req     = editing
      ? this.http.put(`${API}/centers/${editing.id}`, this.centerForm)
      : this.http.post(`${API}/centers`, this.centerForm)

    req.subscribe({
      next:  () => { this.showCenterForm.set(false); this.ok(editing ? 'Centre modifié' : 'Centre créé'); this.loadCenters() },
      error: (e) => this.ko(e),
    })
  }

  deleteCenter(id: number) {
    if (!confirm('Supprimer ce centre ?')) return
    this.http.delete(`${API}/centers/${id}`).subscribe({
      next:  () => { this.ok('Centre supprimé'); this.loadCenters() },
      error: (e) => this.ko(e),
    })
  }

  // ── Spécialités ───────────────────────────────────────────────────────

  loadSpecialties() {
    this.http.get<Specialty[]>(`${API}/specialties`).subscribe({
      next: (d) => this.specialties.set(d),
    })
  }

  addSpecialty() {
    if (!this.newSpecName.trim()) return
    this.http.post(`${API}/specialties`, { name: this.newSpecName.trim() }).subscribe({
      next:  () => { this.newSpecName = ''; this.showSpecForm.set(false); this.ok('Spécialité créée'); this.loadSpecialties() },
      error: (e) => this.ko(e),
    })
  }

  deleteSpecialty(id: number) {
    if (!confirm('Supprimer cette spécialité ?')) return
    this.http.delete(`${API}/specialties/${id}`).subscribe({
      next:  () => { this.ok('Spécialité supprimée'); this.loadSpecialties() },
      error: (e) => this.ko(e),
    })
  }

  // ── Médecins ──────────────────────────────────────────────────────────

  loadDoctors() {
    this.docsLoading.set(true)
    this.http.get<Doctor[]>(`${API}/doctors`).subscribe({
      next:  (d) => { this.doctors.set(d); this.docsLoading.set(false) },
      error: ()  => this.docsLoading.set(false),
    })
  }

  openDoctorForm(doctor?: Doctor) {
    this.editingDoctor.set(doctor ?? null)
    this.doctorForm = doctor
      ? { name: doctor.name, specialtyId: doctor.specialtyId, centerId: doctor.centerId, isAvailable: doctor.isAvailable }
      : { name: '', specialtyId: 0, centerId: 0, isAvailable: true }
    this.showDoctorForm.set(true)
    this.showAbsenceFormFor.set(null)
  }

  saveDoctor() {
    const editing = this.editingDoctor()
    const req     = editing
      ? this.http.put(`${API}/doctors/${editing.id}`, this.doctorForm)
      : this.http.post(`${API}/doctors`, this.doctorForm)

    req.subscribe({
      next:  () => { this.showDoctorForm.set(false); this.ok(editing ? 'Médecin modifié' : 'Médecin créé'); this.loadDoctors() },
      error: (e) => this.ko(e),
    })
  }

  toggleAbsenceForm(doctorId: number) {
    if (this.showAbsenceFormFor() === doctorId) {
      this.showAbsenceFormFor.set(null)
    } else {
      this.absenceForm = { startDate: '', endDate: '', reason: 'SICKNESS' }
      this.showAbsenceFormFor.set(doctorId)
      this.showDoctorForm.set(false)
    }
  }

  saveAbsence(doctorId: number) {
    this.http.post(`${API}/doctors/${doctorId}/absences`, this.absenceForm).subscribe({
      next:  () => { this.showAbsenceFormFor.set(null); this.ok('Absence déclarée'); this.loadDoctors() },
      error: (e) => this.ko(e),
    })
  }

  deleteAbsence(doctorId: number, absenceId: number) {
    this.http.delete(`${API}/doctors/${doctorId}/absences/${absenceId}`).subscribe({
      next:  () => { this.ok('Absence supprimée'); this.loadDoctors() },
      error: (e) => this.ko(e),
    })
  }

  // ── Helpers template ─────────────────────────────────────────────────

  statusLabel(s: string) {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmé', CANCELLED: 'Annulé' } as Record<string, string>)[s] ?? s
  }

  statusClass(s: string) {
    return ({ PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled' } as Record<string, string>)[s] ?? ''
  }

  reasonLabel(r: string) {
    return ({ SICKNESS: 'Maladie', VACATION: 'Congés', OTHER: 'Autre' } as Record<string, string>)[r] ?? r
  }

  get pendingCount():   number { return this.appointments().filter(a => a.status === 'PENDING').length }
  get confirmedCount(): number { return this.appointments().filter(a => a.status === 'CONFIRMED').length }
  get cancelledCount(): number { return this.appointments().filter(a => a.status === 'CANCELLED').length }
}
