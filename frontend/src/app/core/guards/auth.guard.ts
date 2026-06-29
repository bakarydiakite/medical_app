import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'

/** Protège les routes accessibles uniquement aux utilisateurs connectés. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router)

  if (localStorage.getItem('token')) return true

  router.navigate(['/login'])
  return false
}

/**
 * Protège les routes réservées aux administrateurs.
 *
 * Le rôle est lu directement depuis le payload JWT (partie centrale,
 * encodée en Base64) pour éviter un appel réseau supplémentaire.
 * La validité cryptographique du token est vérifiée côté backend à
 * chaque requête via JwtAuthGuard.
 */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router)
  const token  = localStorage.getItem('token')

  if (!token) {
    router.navigate(['/login'])
    return false
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    if (payload.role === 'ADMIN') return true

    router.navigate(['/dashboard'])
    return false
  } catch {
    localStorage.removeItem('token')
    router.navigate(['/login'])
    return false
  }
}
