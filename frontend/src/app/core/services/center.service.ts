import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Center } from '../../models/appointment.model'

const API_URL = 'http://localhost:3001/api'

@Injectable({ providedIn: 'root' })
export class CenterService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Center[]> {
    return this.http.get<Center[]>(`${API_URL}/centers`)
  }

  getOne(id: number): Observable<Center> {
    return this.http.get<Center>(`${API_URL}/centers/${id}`)
  }
}
