import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<{ username: string, isLoggedIn: boolean } | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Comprobar si el usuario ya ha iniciado sesión
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  login(username: string, password: string): boolean {
    // Esto es un inicio de sesión simplificado - en producción usarías un servicio backend 
    if (username && password) {
      const user = {
        username,
        isLoggedIn: true
      };

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }

      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }
}
