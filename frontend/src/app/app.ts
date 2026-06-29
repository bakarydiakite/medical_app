import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <!-- RouterOutlet est l'emplacement où Angular affiche la page courante -->
    <!-- Quand l'URL change, Angular remplace le contenu de router-outlet -->
    <router-outlet />
  `,
  styles: []
})
export class App {}