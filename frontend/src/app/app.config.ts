import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { routes } from './app.routes'
import { authInterceptor } from './core/interceptors/auth.interceptor'

export const appConfig: ApplicationConfig = {
  providers: [
    // Mode zoneless : pas besoin de Zone.js
    provideZonelessChangeDetection(),

    // Active le router avec nos routes définies dans app.routes.ts
    provideRouter(routes),

    // Active HttpClient avec notre intercepteur d'authentification
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
}