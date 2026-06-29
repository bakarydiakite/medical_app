import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, throwError } from 'rxjs'

/**
 * Intercepteur HTTP — injecte automatiquement le token JWT dans chaque requête
 * et redirige vers /login si le backend retourne un 401 (token expiré ou invalide).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const token  = localStorage.getItem('token')

  // Les requêtes HTTP sont immuables en Angular — on doit cloner avant de modifier
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token')
        router.navigate(['/login'])
      }
      return throwError(() => error)
    })
  )
}
