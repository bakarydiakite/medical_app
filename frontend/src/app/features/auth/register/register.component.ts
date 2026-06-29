import { Component, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { AuthService } from '../../../core/services/auth.service'
import { RegisterRequest } from '../../../models/user.model'

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  // Données du formulaire d'inscription
  formData: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  }

  // Signal pour la confirmation du mot de passe
  confirmPassword = signal('')

  // Signal pour l'état de chargement
  isLoading = signal(false)

  // Signal pour les messages d'erreur
  errorMessage = signal('')

  // Signal pour le message de succès
  successMessage = signal('')

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // -------------------------------------------------------
  // Vérifie que les deux mots de passe correspondent
  // -------------------------------------------------------
  get passwordsMatch(): boolean {
    return this.formData.password === this.confirmPassword()
  }

  // -------------------------------------------------------
  // Appelé quand l'utilisateur soumet le formulaire
  // -------------------------------------------------------
  onSubmit(): void {
    this.errorMessage.set('')

    // Vérification que les mots de passe correspondent
    if (!this.passwordsMatch) {
      this.errorMessage.set('Les mots de passe ne correspondent pas')
      return
    }

    this.isLoading.set(true)

    this.authService.register(this.formData).subscribe({
      next: () => {
        this.successMessage.set('Compte créé avec succès. Redirection...')

        // Redirige vers le login après 1.5 secondes
        setTimeout(() => {
          this.router.navigate(['/login'])
        }, 1500)
      },

      error: (err) => {
        this.errorMessage.set(
          err.error?.message ?? 'Une erreur est survenue'
        )
        this.isLoading.set(false)
      }
    })
  }
}