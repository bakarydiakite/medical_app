import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Appointment, CreateAppointmentRequest } from '../../models/appointment.model'

const API_URL = 'http://localhost:3001/api'

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private http: HttpClient) {}

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${API_URL}/appointments`)
  }

  getOne(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${API_URL}/appointments/${id}`)
  }

  create(data: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${API_URL}/appointments`, data)
  }

  cancel(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${API_URL}/appointments/${id}/cancel`, {})
  }
}
