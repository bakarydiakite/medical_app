import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Doctor } from '../../models/appointment.model'

const API_URL = 'http://localhost:3001/api'

export interface TimeSlot {
  time: string      // ex: "09:30"
  dateTime: string  // ISO 8601 UTC, envoyé tel quel au backend
  available: boolean
}

export interface AvailableSlotsResponse {
  available: boolean
  slots: TimeSlot[]
  reason?: string   // présent si available = false (ex: médecin absent)
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private http: HttpClient) {}

  getAll(centerId?: number, specialtyId?: number): Observable<Doctor[]> {
    const params: string[] = []
    if (centerId)    params.push(`centerId=${centerId}`)
    if (specialtyId) params.push(`specialtyId=${specialtyId}`)
    const query = params.length ? `?${params.join('&')}` : ''
    return this.http.get<Doctor[]>(`${API_URL}/doctors${query}`)
  }

  getAvailableSlots(doctorId: number, date: string): Observable<AvailableSlotsResponse> {
    return this.http.get<AvailableSlotsResponse>(
      `${API_URL}/doctors/${doctorId}/available-slots?date=${date}`
    )
  }
}
