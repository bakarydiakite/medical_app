import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { tap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../models/user.model'
import { environment } from '../../../environments/environment'

const API_URL = environment.apiUrl

/**
 * Service d'authentification — singleton partagé dans toute l'application.
 *
 * L'état de l'utilisateur connecté est exposé via un Signal Angular pour
 * permettre une réactivité fine sans Zone.js (mode zoneless).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  currentUser = signal<User | null>(null)

  constructor(private http: HttpClient, private router: Router) {
    // Si un token est présent au démarrage (rechargement de page),
    // on valide côté serveur avant de restaurer la session
    if (this.isLoggedIn()) {
      this.getMe().subscribe({ error: () => this.logout() })
    }
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${API_URL}/auth/register`, data)
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, data).pipe(
      tap((response) => {
        localStorage.setItem('token', response.accessToken)
        this.currentUser.set(response.user)
      })
    )
  }

  logout(): void {
    localStorage.removeItem('token')
    this.currentUser.set(null)
    this.router.navigate(['/login'])
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${API_URL}/auth/me`).pipe(
      tap((user) => this.currentUser.set(user))
    )
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token')
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN'
  }
}
