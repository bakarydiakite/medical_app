// Rôles possibles d'un utilisateur — miroir de l'enum backend
export type UserRole = 'PATIENT' | 'ADMIN'

// Structure d'un utilisateur retourné par le backend
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
}

// Données envoyées lors de l'inscription
export interface RegisterRequest {
  name: string
  email: string
  password: string
  role?: UserRole
}

// Données envoyées lors de la connexion
export interface LoginRequest {
  email: string
  password: string
}

// Réponse du backend après connexion réussie
export interface AuthResponse {
  accessToken: string
  user: User
}