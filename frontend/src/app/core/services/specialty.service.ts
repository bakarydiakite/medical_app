import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Specialty } from '../../models/appointment.model'

const API_URL = 'http://localhost:3001/api'

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${API_URL}/specialties`)
  }
}
