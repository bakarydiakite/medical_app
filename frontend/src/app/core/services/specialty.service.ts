import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Specialty } from '../../models/appointment.model'
import { environment } from '../../../environments/environment'

const API_URL = environment.apiUrl

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${API_URL}/specialties`)
  }
}
