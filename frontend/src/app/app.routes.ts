import { Routes } from '@angular/router'
import { authGuard, adminGuard } from './core/guards/auth.guard'

export const routes: Routes = [
  // Route par défaut → redirige vers login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Page de login — accessible sans être connecté
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      )
  },

  // Page d'inscription — accessible ici
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      )
  },

  // Dashboard patient — protégé par authGuard
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointments/appointment-list/appointment-list').then(
        (m) => m.AppointmentListComponent
      )
  },

  // Dashboard admin — protégé par adminGuard
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboardComponent
      )
  },

  // Prise de rendez-vous — protégée par authGuard
  {
    path: 'appointments/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointments/appointment-form/appointment-form').then(
        (m) => m.AppointmentFormComponent
      )
  },

  // Toute route inconnue → redirige vers login
  {
    path: '**',
    redirectTo: 'login'
  }
]
