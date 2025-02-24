import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    console.log("🔍 Verificando autenticação...");

    const user = await this.supabaseService.getUser();

    if (!user) {
      console.warn("🔒 Acesso negado! Redirecionando para login...");
      this.router.navigate(['/login']);
      return false;
    }

    console.log("✅ Acesso permitido!");
    return true;
  }
}