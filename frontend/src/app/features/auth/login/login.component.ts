import { Component, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { AuthService } from '../../../core/services/auth.service'
import { LoginRequest } from '../../../models/user.model'

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  // Données du formulaire liées au HTML via [(ngModel)]
  formData: LoginRequest = {
    email: '',
    password: ''
  }

  // Signal pour afficher/masquer le chargement
  isLoading = signal(false)

  // Signal pour afficher les erreurs
  errorMessage = signal('')

  // AuthService et Router injectés automatiquement
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // -------------------------------------------------------
  // Appelé quand l'utilisateur soumet le formulaire
  // -------------------------------------------------------
  onSubmit(): void {
    // Réinitialise le message d'erreur
    this.errorMessage.set('')

    // Active l'indicateur de chargement
    this.isLoading.set(true)

    // Appelle le service de login
    this.authService.login(this.formData).subscribe({
      // Succès — redirige selon le rôle
      next: () => {
        const role = this.authService.currentUser()?.role
        this.router.navigate([role === 'ADMIN' ? '/admin' : '/dashboard'])
      },

      // Erreur — affiche le message d'erreur
      error: (err) => {
        this.errorMessage.set(
          err.error?.message ?? 'Email ou mot de passe incorrect'
        )
        this.isLoading.set(false)
      }
    })
  }
}